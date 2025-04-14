const dotenvFlow = require('dotenv-flow');
const express = require('express');
const axios = require('axios');
const unzipper = require('unzipper');
const fs = require('fs');
const path = require('path');

// Load environment variables dynamically
dotenvFlow.config();
require('dotenv').config({ path: '.env.mistral.ai', override: true });

const app = express();
const PORT = process.env.PORT || 3002;

let GITHUB_TOKEN = process.env.GITHUB_TOKEN;
let OWNER = process.env.REPO_OWNER;
let REPO = process.env.REPO_NAME;
let MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

app.set("view engine", "ejs");
app.set("views", __dirname);
app.use(express.static(__dirname));
app.use(express.json());

async function fetchRuns() {
    try {
        const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/runs`;
        const response = await axios.get(url, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } });

        return response.data.workflow_runs
            .filter(run => run.conclusion === "failure")
            .slice(0, 2)
            .map(run => ({
                id: run.run_number,
                name: run.name || `Run #${run.run_number}`,
                status: run.conclusion,
                logs_url: run.logs_url,
                branch: run.head_branch,
                errors: [],
                aiRecommendation: "Loading...",
            }));
    } catch (error) {
        console.error("Error fetching workflow runs:", error.message);
        return [];
    }
}

async function fetchErrors(logsUrl) {
    try {
        const response = await axios.get(logsUrl, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
            responseType: "arraybuffer"
        });

        const zipPath = "logs.zip";
        fs.writeFileSync(zipPath, response.data);

        let errorLines = [];
        await fs.createReadStream(zipPath)
            .pipe(unzipper.Parse())
            .on("entry", entry => {
                if (entry.path.endsWith(".txt")) {
                    let content = "";
                    entry.on("data", chunk => (content += chunk.toString()));
                    entry.on("end", () => {
                        errorLines.push(...content.split("\n").filter(line => /error|failed|fatal/i.test(line)));
                    });
                } else {
                    entry.autodrain();
                }
            });

        return new Promise(resolve => setTimeout(() => resolve(errorLines), 2000));
    } catch (error) {
        console.error("Error fetching logs:", error.message);
        return ["Error fetching logs"];
    }
}

async function fetchYamlFile(branch) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/.github/workflows/commit.yml?ref=${branch}`;
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3.raw'
            },
        });

        return response.data;
    } catch (error) {
        console.error(`Error fetching YAML file from ${url}:`, error.message);
        return null;
    }
}

async function getAIRecommendations(errors, yamlFile) {
    if (errors.length === 0) return "No recommendations available.";

    const prompt = `Analyze these logs and the workflow YAML file. If needed, suggest an updated YAML file.\n\nError Logs:\n${errors.join("\n")}\n\nYAML File:\n${yamlFile}`;

    try {
        const response = await axios.post(
            "https://api.mistral.ai/v1/chat/completions",
            { model: "mistral-large-latest", messages: [{ role: "system", content: prompt }], max_tokens: 2000 },
            { headers: { Authorization: `Bearer ${MISTRAL_API_KEY}`, "Content-Type": "application/json" } }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error getting AI recommendation:", error.message);
        return "AI could not generate a recommendation.";
    }
}

app.get("/", async (req, res) => {
    try {
        const runs = await fetchRuns();

        for (const run of runs) {
            const yamlFile = await fetchYamlFile(run.branch);
            const errors = await fetchErrors(run.logs_url);
            const aiRecommendation = await getAIRecommendations(errors, yamlFile);
            run.errors = errors;
            run.aiRecommendation = aiRecommendation;
        }

        res.render("index", { runs });
    } catch (error) {
        console.error("Error rendering page:", error.message);
        res.status(500).send("Error fetching data");
    }
});

app.post('/update-env', (req, res) => {
    const { githubToken, repoOwner, repoName } = req.body;

    try {
        if (fs.existsSync('.env')) fs.unlinkSync('.env'); // Delete old file

        fs.writeFileSync('.env', `GITHUB_TOKEN=${githubToken}\nREPO_OWNER=${repoOwner}\nREPO_NAME=${repoName}\n`);
        
        dotenvFlow.config();
        require('dotenv').config({ path: '.env.mistral.ai', override: true });

        // **Update global environment variables dynamically**
        process.env.GITHUB_TOKEN = githubToken;
        process.env.REPO_OWNER = repoOwner;
        process.env.REPO_NAME = repoName;

        // Update in-memory values
        GITHUB_TOKEN = githubToken;
        OWNER = repoOwner;
        REPO = repoName;

        res.json({ message: 'Environment variables updated successfully! No restart required.' });

    } catch (error) {
        console.error("Error updating environment:", error);
        res.status(500).json({ message: 'Failed to update environment variables.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
