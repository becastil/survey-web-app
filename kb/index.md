# Healthcare Survey Dashboard - Knowledge Base

## Purpose

This knowledge base serves as the single source of truth for the Healthcare Survey Dashboard application. It documents architecture decisions, implementation patterns, development workflows, and operational procedures. The KB is designed to support continuous improvement through recursive refinement - each iteration builds upon previous knowledge to enhance code quality, performance, and maintainability.

## How to Use This KB

1. **For New Developers**: Start with the [Architecture Overview](./architecture/overview.md) to understand the system design
2. **For Implementation**: Reference the [Frontend](./frontend/conventions.md) and [Backend](./backend/api-contracts.md) guides
3. **For Operations**: Follow the [Deployment Runbook](./ops/deployment-runbook.md) and [Release Process](./ops/release-process.md)
4. **For Contributing**: Read [Contributing Guidelines](./contributing.md) before submitting PRs

## Knowledge Areas

### 🏗️ Architecture
- [System Architecture Overview](./architecture/overview.md) - High-level system design and components
- [ADR-0001: Technology Stack](./architecture/adr/ADR-0001-tech-stack.md) - Core technology decisions and rationale

### ✨ Features
- [Healthcare Data Visualization](./features/healthcare-visualization.md) - Plotly.js charts and data processing module
- [Survey Management](../FEATURES.md#survey-management) - Survey creation and distribution
- [Analytics & Reporting](../FEATURES.md#analytics--reporting) - Real-time analytics and reports

### 🎨 Frontend Development
- [Frontend Conventions](./frontend/conventions.md) - React, Next.js, and TypeScript patterns
- [Components Cookbook](./frontend/components-cookbook.md) - Reusable component patterns and examples

### ⚙️ Backend Development
- [API Contracts](./backend/api-contracts.md) - RESTful API specifications and schemas

### 🗄️ Data Management
- [Database Schema](./data/schema.md) - Entity relationships and data models
- [RLS Policies](./data/rls-policies.md) - Row-level security implementation
- [Migrations Runbook](./data/migrations-runbook.md) - Database migration procedures

### 🛠️ Development
- [Environment Variables](./dev/env-vars.md) - Configuration and secrets management
- [Testing Strategy](./dev/testing-strategy.md) - Test pyramid and coverage goals
- [Performance Budget](./dev/performance-budget.md) - Performance metrics and thresholds
- [Accessibility Checklist](./dev/accessibility-checklist.md) - WCAG 2.2 AA compliance guide

### 🚀 Operations
- [Deployment Runbook](./ops/deployment-runbook.md) - Step-by-step deployment procedures
- [Observability](./ops/observability.md) - Monitoring, logging, and alerting
- [Release Process](./ops/release-process.md) - Version management and changelog

### 🤝 Contributing
- [Contributing Guidelines](./contributing.md) - Code standards and PR process
- [Pull Request Template](./.github/PULL_REQUEST_TEMPLATE.md) - PR checklist and requirements

## Recursive Improvement Process

This KB supports continuous improvement through:

1. **Documentation-Driven Development**: Write docs first, implement second
2. **Knowledge Accumulation**: Each PR adds to the collective knowledge
3. **Pattern Recognition**: Identify and document recurring patterns
4. **Feedback Loops**: Use production insights to refine documentation
5. **Version Control**: Track all KB changes for historical context

## Quick Links

- **GitHub Repository**: [survey-web-app](https://github.com/user/survey-web-app)
- **Live Application**: [Healthcare Survey Dashboard](https://survey-app.vercel.app)
- **CI/CD Pipeline**: [GitHub Actions](./.github/workflows/)
- **Issue Tracker**: [GitHub Issues](https://github.com/user/survey-web-app/issues)

## Maintenance

The KB should be updated:
- With every architectural decision
- When new patterns are established
- After post-mortems and learnings
- During quarterly reviews

Last Updated: 2025-08-22
Version: 1.1.0

## Recent Updates
- **2025-08-22**: Added Healthcare Data Visualization module with Plotly.js
- **2025-08-20**: Initial knowledge base structure