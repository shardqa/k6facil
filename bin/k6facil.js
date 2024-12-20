#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import chalk from 'chalk';  // Vamos adicionar cores para melhor visualização

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const generateTestPath = path.join(__dirname, '..', 'src', 'scripts', 'generateTest.js');

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

function interpretK6ExitCode(code) {
    const results = {
        0: {
            status: 'success',
            message: chalk.green('\n✓ Teste concluído com sucesso!')
        },
        99: {
            status: 'threshold',
            message: chalk.yellow('\n⚠ Teste concluído, mas alguns thresholds não foram atingidos:'),
            details: [
                '- Verifique os resultados acima para identificar quais métricas falharam',
                '- Compare os thresholds definidos com os resultados obtidos',
                '- Considere ajustar os thresholds ou investigar problemas de performance'
            ]
        },
        100: {
            status: 'invalid',
            message: chalk.red('\n✗ Erro de validação no script de teste.')
        },
        101: {
            status: 'runtime',
            message: chalk.red('\n✗ Erro durante a execução do teste.')
        },
        102: {
            status: 'system',
            message: chalk.red('\n✗ Erro de sistema durante a execução do teste.')
        }
    };

    return results[code] || {
        status: 'unknown',
        message: chalk.red(`\n✗ Erro desconhecido (código ${code})`)
    };
}

async function showModelConfig() {
    console.error(chalk.cyan('Usage: k6facil <config.json>\n'));
    console.log(chalk.yellow('Modelo de configuração JSON:'));
    console.log(JSON.stringify(MODEL_CONFIG, null, 2));
}

async function main() {
    const jsonFile = process.argv[2];
    
    if (!jsonFile) {
        await showModelConfig();
        process.exit(1);
    }

    try {
        await fs.access(jsonFile);
        
        const { spawn } = await import('child_process');
        
        const nodeProcess = spawn('node', [generateTestPath, jsonFile, 'run'], {
            stdio: 'inherit'
        });

        nodeProcess.on('close', (code) => {
            const result = interpretK6ExitCode(code);
            console.log(result.message);
            
            if (result.details) {
                console.log(chalk.yellow('\nDetalhes:'));
                result.details.forEach(detail => console.log(chalk.yellow(detail)));
            }
            
            // Saímos com código 0 para threshold (99) e sucesso (0)
            process.exit([0, 99].includes(code) ? 0 : 1);
        });

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(chalk.red(`\nError: Arquivo '${jsonFile}' não encontrado`));
            await showModelConfig();
        } else {
            console.error(chalk.red('\nError:'), error.message);
        }
        process.exit(1);
    }
}

main();
