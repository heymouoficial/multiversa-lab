# Track Plan: Ensure the ingestion of BCV rates using GitHub Actions and Supabase Edge Functions is functional and operational.

## Phase 1: Supabase Edge Function Development

### Goal
Develop and test the core Supabase Edge Function responsible for fetching, parsing, and storing BCV exchange rates.

### Tasks
- [x] Task: Adapt existing Supabase Edge Function for BCV rates ingestion
    - [x] Task: Modify the existing `bcv-rates` function to align with the `spec.md`.
    - [x] Task: Update the data model to store rates per currency and date.
    - [x] Task: Refactor the code to support this new data model.
- [x] Task: Create tests for the Edge Function
    - [ ] Task: Create a new test file for the `bcv-rates` function.
    - [x] Task: Write tests for data fetching, parsing, and storage logic.
- [x] Task: Implement data fetching from BCV source
    - [x] Task: Research and identify the official BCV data source URL and structure.
    - [x] Task: Write code to make HTTP requests and retrieve raw data.
    - [x] Task: Conductor - User Manual Verification 'Implement data fetching from BCV source' (Protocol in workflow.md)
- [x] Task: Implement data parsing and validation
    - [x] Task: Write code to parse the raw data into structured exchange rate objects.
    - [x] Task: Implement validation logic for parsed data (e.g., data types, ranges).
    - [x] Task: Conductor - User Manual Verification 'Implement data parsing and validation' (Protocol in workflow.md)
- [x] Task: Implement Supabase database integration
    - [x] Task: Define and create the `bcv_rates` table schema in Supabase.
    - [x] Task: Write code to insert processed exchange rates into the `bcv_rates` table, ensuring idempotency.
    - [x] Task: Conductor - User Manual Verification 'Implement Supabase database integration' (Protocol in workflow.md)
- [x] Task: Implement error handling and logging within the Edge Function
    - [x] Task: Add try-catch blocks for all external calls and critical operations.
    - [x] Task: Integrate logging for successful runs, warnings, and errors.
- [ ] Task: Conductor - User Manual Verification 'Supabase Edge Function Development' (Protocol in workflow.md)

## Phase 2: GitHub Actions Integration and Scheduling [checkpoint: manual]

### Goal
Configure a GitHub Actions workflow to schedule and trigger the Supabase Edge Function.

### Tasks
- [x] Task: Create GitHub Actions workflow file
    - [x] Task: Create a new `.yml` file in `.github/workflows/` for BCV rates ingestion.
    - [x] Task: Define the workflow trigger (e.g., daily cron schedule).
- [x] Task: Configure environment variables for GitHub Actions
    - [x] Task: Securely add Supabase API key and other necessary secrets to GitHub Actions.
- [x] Task: Implement workflow step to call Supabase Edge Function
    - [x] Task: Write workflow step to invoke the deployed Supabase Edge Function.
- [x] Task: Test GitHub Actions workflow
    - [x] Task: Manually trigger the workflow to verify function invocation.
    - [x] Task: Conductor - User Manual Verification 'GitHub Actions Integration and Scheduling' (Protocol in workflow.md)

## Phase 3: Monitoring and Refinements [checkpoint: manual]

### Goal
Ensure the entire ingestion pipeline is stable, observable, and performant.

### Tasks
- [x] Task: Review and enhance error alerting
    - [x] Task: Set up notifications for GitHub Actions workflow failures.
    - [x] Task: Implement additional alerts for Edge Function failures (if not covered by Supabase defaults).
- [x] Task: Documentation
    - [x] Task: Document the BCV rates ingestion process, including setup, maintenance, and troubleshooting.
- [x] Task: Conductor - User Manual Verification 'Monitoring and Refinements' (Protocol in workflow.md)
