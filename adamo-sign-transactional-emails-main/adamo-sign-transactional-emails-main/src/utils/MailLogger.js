import fs from 'fs';
import path from 'path';

class Logger {
    constructor() {
        this.logDir = path.join(process.cwd(), 'logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }
    }

    logMailError(error, emailData) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            error: error.message,
            errorCode: error.statusCode,
            emailTo: emailData.to,
            subject: emailData.subject
        };

        const logFile = path.join(this.logDir, 'mail-errors.log');
        fs.appendFileSync(
            logFile, 
            JSON.stringify(logEntry) + '\n'
        );
    }
}

export default new Logger();