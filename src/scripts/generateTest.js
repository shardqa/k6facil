import { K6Parser } from '../lib/parser.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MODEL_CONFIG = {
    "endpoint": {
        "url": "https://api.exemplo.com",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer seu-token"
        },
        "body": {
            "chave": "valor"
        }
    },
    "loadTest": {
        "startVUs": 1,
        "maxVUs": 5,
        "stages": [
            { "duration": "10s", "target": 3 },
            { "duration": "20s", "target": 5 },
            { "duration": "10s", "target": 0 }
        ],
        "thresholds": {
            "http_req_duration": ["p(95)<300"],
            "http_req_failed": ["rate<0.01"]
        }
    }
};

async function showModelConfig() {
    console.log('\nModelo de configuração JSON:');
    console.log(JSON.stringify(MODEL_CONFIG, null, 2));
    console.log('\nCrie um arquivo com esta estrutura e execute:');
    console.log('node src/scripts/generateTest.js seu-arquivo.json run');
}

async function loadConfig(configPath) {
    try {
        const jsonContent = await fs.readFile(configPath, 'utf8');
        return JSON.parse(jsonContent);
    } catch (error) {
        console.error('Erro ao ler arquivo de configuração');
        await showModelConfig();
        process.exit(1);
    }
}

async function runTest(scriptPath) {
    try {
        const { spawn } = await import('child_process');
        
        return new Promise((resolve, reject) => {
            const k6Process = spawn('k6', ['run', scriptPath], {
                stdio: 'inherit'
            });

            k6Process.on('close', (code) => {
                // Não tratamos como erro, apenas retornamos o código
                resolve(code);
            });

            k6Process.on('error', (err) => {
                reject(err);
            });
        });
    } catch (error) {
        console.error('Error running test:', error);
        throw error;
    }
}

async function main() {
    try {
        const configPath = process.argv[2];
        const mode = process.argv[3] || 'script';
        
        if (!configPath) {
            console.log('Por favor, forneça um arquivo de configuração JSON!');
            await showModelConfig();
            return;
        }

        const config = await loadConfig(configPath);
        const parser = new K6Parser();
        const outputPath = path.join(__dirname, '..', 'tests', 'user-tests', 'generatedTest.js');
        await parser.generateScript(config, outputPath);
        
        if (mode === 'run') {
            const exitCode = await runTest(outputPath);
            process.exit(exitCode); // Apenas passa o código adiante
        } else {
            console.log(`Test script generated at: ${outputPath}`);
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
