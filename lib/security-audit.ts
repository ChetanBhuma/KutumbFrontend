/**
 * Security Audit Utility
 * Checks for common security issues in the application
 */

export interface SecurityIssue {
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    issue: string;
    recommendation: string;
    location?: string;
}

export class SecurityAuditor {
    private issues: SecurityIssue[] = [];

    /**
     * Check for exposed secrets in code
     */
    checkExposedSecrets(code: string, filename: string): void {
        const secretPatterns = [
            { pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/gi, name: 'API Key' },
            { pattern: /secret\s*=\s*['"][^'"]+['"]/gi, name: 'Secret' },
            { pattern: /password\s*=\s*['"][^'"]+['"]/gi, name: 'Password' },
            { pattern: /token\s*=\s*['"][^'"]+['"]/gi, name: 'Token' },
            { pattern: /mongodb:\/\/[^'"]+/gi, name: 'MongoDB Connection String' },
            { pattern: /postgres:\/\/[^'"]+/gi, name: 'PostgreSQL Connection String' },
        ];

        secretPatterns.forEach(({ pattern, name }) => {
            if (pattern.test(code)) {
                this.issues.push({
                    severity: 'critical',
                    category: 'Exposed Secrets',
                    issue: `Potential ${name} found in code`,
                    recommendation: 'Move secrets to environment variables',
                    location: filename,
                });
            }
        });
    }

    /**
     * Check for SQL injection vulnerabilities
     */
    checkSQLInjection(code: string, filename: string): void {
        const sqlPatterns = [
            /query\([^)]*\$\{[^}]+\}/gi, // Template literals in queries
            /query\([^)]*\+[^)]+\)/gi, // String concatenation in queries
            /execute\([^)]*\$\{[^}]+\}/gi,
        ];

        sqlPatterns.forEach((pattern) => {
            if (pattern.test(code)) {
                this.issues.push({
                    severity: 'critical',
                    category: 'SQL Injection',
                    issue: 'Potential SQL injection vulnerability detected',
                    recommendation: 'Use parameterized queries or ORM (Prisma)',
                    location: filename,
                });
            }
        });
    }

    /**
     * Check for XSS vulnerabilities
     */
    checkXSS(code: string, filename: string): void {
        const xssPatterns = [
            /dangerouslySetInnerHTML/gi,
            /innerHTML\s*=/gi,
            /document\.write/gi,
        ];

        xssPatterns.forEach((pattern) => {
            if (pattern.test(code)) {
                this.issues.push({
                    severity: 'high',
                    category: 'XSS',
                    issue: 'Potential XSS vulnerability detected',
                    recommendation: 'Sanitize user input and use safe rendering methods',
                    location: filename,
                });
            }
        });
    }

    /**
     * Check for insecure dependencies
     */
    checkInsecureDependencies(packageJson: any): void {
        const insecurePackages = [
            'request', // Deprecated
            'node-uuid', // Use uuid instead
            'crypto-js', // Use native crypto
        ];

        const dependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
        };

        insecurePackages.forEach((pkg) => {
            if (dependencies[pkg]) {
                this.issues.push({
                    severity: 'medium',
                    category: 'Insecure Dependencies',
                    issue: `Insecure or deprecated package: ${pkg}`,
                    recommendation: 'Update to secure alternative',
                });
            }
        });
    }

    /**
     * Check authentication implementation
     */
    checkAuthentication(code: string, filename: string): void {
        // Check for weak password requirements
        if (filename.includes('auth') || filename.includes('password')) {
            if (!code.includes('bcrypt') && !code.includes('argon2')) {
                this.issues.push({
                    severity: 'critical',
                    category: 'Authentication',
                    issue: 'Password hashing not detected',
                    recommendation: 'Use bcrypt or argon2 for password hashing',
                    location: filename,
                });
            }
        }

        // Check for JWT secret
        if (code.includes('jwt.sign') && code.includes('secret')) {
            if (code.match(/jwt\.sign\([^)]*['"][^'"]{1,20}['"]/)) {
                this.issues.push({
                    severity: 'critical',
                    category: 'Authentication',
                    issue: 'Weak JWT secret detected',
                    recommendation: 'Use strong, random JWT secret from environment',
                    location: filename,
                });
            }
        }
    }

    /**
     * Check CORS configuration
     */
    checkCORS(code: string, filename: string): void {
        if (code.includes('cors')) {
            if (code.includes("origin: '*'") || code.includes('origin:"*"')) {
                this.issues.push({
                    severity: 'high',
                    category: 'CORS',
                    issue: 'CORS configured to allow all origins',
                    recommendation: 'Restrict CORS to specific trusted origins',
                    location: filename,
                });
            }
        }
    }

    /**
     * Check for console.log in production
     */
    checkConsoleLog(code: string, filename: string): void {
        if (code.includes('console.log') || code.includes('console.error')) {
            this.issues.push({
                severity: 'low',
                category: 'Information Disclosure',
                issue: 'Console logging detected',
                recommendation: 'Remove console logs in production or use proper logging',
                location: filename,
            });
        }
    }

    /**
     * Check for eval usage
     */
    checkEval(code: string, filename: string): void {
        if (code.includes('eval(')) {
            this.issues.push({
                severity: 'critical',
                category: 'Code Injection',
                issue: 'eval() usage detected',
                recommendation: 'Never use eval() - find alternative approach',
                location: filename,
            });
        }
    }

    /**
     * Get all detected issues
     */
    getIssues(): SecurityIssue[] {
        return this.issues;
    }

    /**
     * Get issues by severity
     */
    getIssuesBySeverity(severity: SecurityIssue['severity']): SecurityIssue[] {
        return this.issues.filter((issue) => issue.severity === severity);
    }

    /**
     * Generate security report
     */
    generateReport(): string {
        const critical = this.getIssuesBySeverity('critical');
        const high = this.getIssuesBySeverity('high');
        const medium = this.getIssuesBySeverity('medium');
        const low = this.getIssuesBySeverity('low');

        let report = '# Security Audit Report\n\n';
        report += `Generated: ${new Date().toISOString()}\n\n`;
        report += `## Summary\n\n`;
        report += `- Critical: ${critical.length}\n`;
        report += `- High: ${high.length}\n`;
        report += `- Medium: ${medium.length}\n`;
        report += `- Low: ${low.length}\n`;
        report += `- **Total: ${this.issues.length}**\n\n`;

        const addIssues = (severity: string, issues: SecurityIssue[]) => {
            if (issues.length > 0) {
                report += `## ${severity} Severity Issues\n\n`;
                issues.forEach((issue, index) => {
                    report += `### ${index + 1}. ${issue.issue}\n\n`;
                    report += `- **Category:** ${issue.category}\n`;
                    if (issue.location) {
                        report += `- **Location:** ${issue.location}\n`;
                    }
                    report += `- **Recommendation:** ${issue.recommendation}\n\n`;
                });
            }
        };

        addIssues('Critical', critical);
        addIssues('High', high);
        addIssues('Medium', medium);
        addIssues('Low', low);

        return report;
    }

    /**
     * Clear all issues
     */
    clear(): void {
        this.issues = [];
    }
}

// Export singleton instance
export const securityAuditor = new SecurityAuditor();
