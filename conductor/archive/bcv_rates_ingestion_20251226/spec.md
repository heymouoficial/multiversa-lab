# BCV Rates Ingestion Specification

## 1. Introduction
This document specifies the requirements and technical details for establishing a robust and automated system for ingesting Banco Central de Venezuela (BCV) exchange rates. This system will utilize GitHub Actions for scheduling and Supabase Edge Functions for data processing and storage, ensuring that the Multiversa Lab project has access to up-to-date financial data.

## 2. Purpose
The primary purpose of this track is to provide a reliable and automated mechanism for fetching, processing, and storing official BCV exchange rates. This data is crucial for the accurate functioning of financial calculations within applications like CalculaTú and other related services within the Multiversa ecosystem.

## 3. Scope
This track will cover:
*   Automated fetching of BCV exchange rate data from the official source.
*   Parsing and validation of the fetched data.
*   Secure storage of the processed data within Supabase.
*   Scheduling of the ingestion process using GitHub Actions.
*   Error handling and logging mechanisms for monitoring the ingestion process.

## 4. Functional Requirements
*   **FR1: Daily Data Fetching:** The system shall automatically fetch BCV exchange rates at least once daily.
*   **FR2: Data Source:** The system shall retrieve data from the official BCV exchange rate publication.
*   **FR3: Data Parsing:** The system shall accurately parse relevant exchange rate values (e.g., USD, EUR against VES).
*   **FR4: Data Validation:** The system shall validate the fetched data for completeness and correctness before storage.
*   **FR5: Data Storage:** The processed exchange rate data shall be stored in a designated Supabase table.
*   **FR6: Idempotency:** The ingestion process shall be idempotent, preventing duplicate entries for the same date/rate.

## 5. Non-Functional Requirements
*   **NFR1: Reliability:** The ingestion process shall be highly reliable, with automated retries and alerting in case of failures.
*   **NFR2: Accuracy:** Stored exchange rates shall accurately reflect the official BCV published values.
*   **NFR3: Performance:** The data ingestion process shall be efficient and not impact the performance of other Supabase services.
*   **NFR4: Security:** Access to the ingestion function and Supabase database shall adhere to best security practices.
*   **NFR5: Observability:** The system shall provide logging and monitoring capabilities for the ingestion process.

## 6. Technical Details

### 6.1. Data Source
The primary data source will be the official BCV website or API (if available and stable). If direct API access is not feasible, a web scraping approach might be considered, adhering to robots.txt and usage policies.

### 6.2. GitHub Actions
A GitHub Actions workflow will be configured to:
*   Trigger the Supabase Edge Function on a daily schedule (e.g., cron job).
*   Handle environment variables securely (e.g., Supabase API key, BCV data URL).
*   Provide basic logging for workflow execution status.

### 6.3. Supabase Edge Function
A Deno-based Supabase Edge Function will be developed to:
*   Make HTTP requests to the BCV data source.
*   Parse the response (e.g., HTML, JSON) to extract exchange rates.
*   Perform data validation (e.g., check for valid numbers, dates).
*   Interact with the Supabase database using the Supabase client library to store the rates.
*   Implement error handling for network issues, parsing failures, and database operations.
*   Log detailed information about the ingestion process, including success/failure and any errors encountered.

### 6.4. Supabase Database Schema
A new table (e.g., `bcv_rates`) will be created in Supabase with columns such as:
*   `id` (UUID, primary key)
*   `date` (DATE, unique constraint for idempotency)
*   `currency` (TEXT, e.g., 'USD', 'EUR')
*   `rate` (NUMERIC)
*   `created_at` (TIMESTAMP WITH TIME ZONE)
*   `updated_at` (TIMESTAMP WITH TIME ZONE)

### 6.5. Error Handling and Monitoring
*   The Edge Function will implement try-catch blocks for robust error handling.
*   Logging will be integrated to provide visibility into the function's execution and any issues.
*   GitHub Actions workflow logs will provide a historical record of trigger attempts and immediate execution results.