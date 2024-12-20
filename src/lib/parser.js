// src/lib/parser.js
import Ajv from 'ajv';
import Handlebars from 'handlebars';
import { loadTestSchema } from './schemaValidator.js';
import { baseTemplate } from './templates/baseScript.js';

class K6Parser {
    constructor() {
        this.ajv = new Ajv();
        this.validate = this.ajv.compile(loadTestSchema);
        Handlebars.registerHelper('eq', function(v1, v2) {
          return v1 === v2;
        });
        this.template = Handlebars.compile(baseTemplate);
    }

    parseConfig(jsonConfig) {
        // Valida o JSON contra o schema
        const valid = this.validate(jsonConfig);
        if (!valid) {
            throw new Error(`Invalid configuration: ${JSON.stringify(this.validate.errors)}`);
        }

        // Prepara os dados para o template
        const templateData = {
            url: jsonConfig.endpoint.url,
            method: jsonConfig.endpoint.method.toLowerCase(),
            headers: this.sanitizeJSON(jsonConfig.endpoint.headers || {}),
            body: this.sanitizeJSON(jsonConfig.endpoint.body || {}),
            stages: this.sanitizeJSON(jsonConfig.loadTest.stages || []),
            startVUs: jsonConfig.loadTest.startVUs,
            maxVUs: jsonConfig.loadTest.maxVUs,
            thresholds: this.sanitizeJSON(jsonConfig.loadTest.thresholds || {})
        };

        // Gera o script K6
        return this.template(templateData);
    }

    sanitizeJSON(obj) {
        return JSON.stringify(obj).replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }

    async generateScript(jsonConfig, outputPath) {
        const fs = await import('fs/promises');
        const script = this.parseConfig(jsonConfig);
        await fs.writeFile(outputPath, script, 'utf8');
        return outputPath;
    }
}

export { K6Parser };
