---
source: 18
category: docs
title: Enterprise
url: "https://antigravity.google/docs/enterprise"
final_url: "https://antigravity.google/docs/enterprise"
fetched: 2026-08-13
status: 200
---
# Antigravity in Gemini Enterprise

Integration with **Gemini Enterprise and Gemini Enterprise Agent Platform** enables enterprise development teams to deploy Google Antigravity using models hosted directly within your organization’s Google Cloud infrastructure. Every session runs under Google Cloud’s enterprise security controls, data residency guarantees, and the Google Cloud Terms of Service.

Supported products: [Antigravity 2.0](/product/antigravity-2) [Antigravity CLI](/product/antigravity-cli)

info**Note**: Enterprise integration is supported for Antigravity 2.0 and Antigravity CLI. **Antigravity IDE** is currently not supported for enterprise deployments.[View Supported Models](/docs/models)

## Overview & Key Benefits

You can use Antigravity in two ways:

- **Agent Platform** - Connect directly to Agent Platform to use Antigravity with pay-as-you-go billing.
- **Gemini Enterprise license** - Connect with your Gemini Enterprise license to get access to included quotas, managed overages as well as advanced administrative controls.

By connecting Google Antigravity to your Google Cloud project, your organization gains:

- **Enterprise Governance**: Operates under your existing Google Cloud Terms of Service with centralized administrative controls.
- **Data Residency & Security**: Satisfies private networking (VPC Service Controls) and regional data residency constraints. Enterprise prompts, responses, code, and telemetry are never stored outside your private environments.
- **Consumption Billing**: Integrates directly with your Google Cloud Billing account for unified consumption invoicing at Agent Platform pricing.

## Before You Begin

Make sure your environment meets the following prerequisites:

- A **Gemini Enterprise Standard**,**Gemini Enterprise Plus** or **Gemini Enterprise Pay-as-you go** edition. *(Other editions, such as Gemini Enterprise for Business, are planned for future releases but are not currently supported).*
- A Google Cloud project ID and a deployment location—`global`, `us`, or `eu`—that carries your license.
- For Bring Your Own Identity (BYOID), an administrator must configure Cloud Identity or Workforce Identity Federation for your organization.

## IAM Roles & Permissions Matrix

Before configuring your environment, review the Identity and Access Management (IAM) roles required for initial project setup and model inference:

| Action / Setup Step | Required IAM Role | Permission ID |
|----|----|----|
| **Create GCP Project** | Project Creator (`roles/resourcemanager.projectCreator`) | `resourcemanager.projects.create` |
| **Enable Agent Platform API** | Service Usage Admin (`roles/serviceusage.serviceUsageAdmin`) | `serviceusage.services.enable` |
| **Use Antigravity Models** | Agent Platform User (`roles/aiplatform.user`) | `aiplatform.user` |

## Administrator Setup Guide

### Gemini Enterprise Setup

To setup Gemini Enterprise subscriptions, follow the official Google Cloud onboarding guide.

[Gemini Enterprise Documentation](https://docs.cloud.google.com/gemini/enterprise/docs/ai-developer-tools-overview)

### Google Cloud Environment Provisioning

Complete the following three steps to provision your Google Cloud project and enable API access.

#### Step 1: Select or Create a Google Cloud Project

Select an existing project or create a dedicated project for your team’s Antigravity workloads.

info**Project Switching Note**: To switch to a different Google Cloud project or location, log out of the Antigravity CLI or Hub, then log back in to select your new project or region. [Go to GCP Project Selector](https://console.cloud.google.com/projectselector2)

#### Step 2: Verify Cloud Billing

Ensure that Cloud Billing is active for your selected Google Cloud project. You can inspect your project’s billing status in the Cloud Console.

[Open Google Cloud Billing Console](https://console.cloud.google.com/billing)

#### Step 3: Enable the Agent Platform API

Enable the Agent Platform API (`aiplatform.googleapis.com`) to allow Antigravity clients to connect to your project’s model endpoints.

[Enable Agent Platform API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com)

## Sign In & License Selection

Google Antigravity uses a single sign-on (SSO) flow. When you sign in with your corporate business account, your license tier is automatically detected without requiring manual tier selection.

### Sign-In Workflow

1.  Start **Antigravity 2.0** or the **Antigravity CLI**.
2.  Select **Sign in** to open the browser authentication flow.
3.  Choose **Business account** *(subject to the Google Cloud Terms of Service)*.
4.  Select **Continue with Google Cloud** (or configure Advanced SSO / WIF).
5.  Complete authentication in your browser.
6.  Once authenticated, the **License Selector** displays your assigned licenses. Confirm the project linked to your license and select it.
7.  Alternatively, select **Other** to self-assign a license by entering your project ID and selecting a location (`global`, `us`, or `eu`).

info**Data-Sharing & Project Logging Notice**: Your customer telemetry and model interactions are logged directly to the Google Cloud project corresponding to the license you select. You can maintain **one license per project and location**.

## Bring Your Own Identity (BYOID / WIF)

Bring Your Own Identity (BYOID) uses Workforce Identity Federation (WIF) to let your organization authenticate through an external identity provider, such as Okta, instead of a standard Google Account.

### Configuring BYOID

1.  In Antigravity, select **Business account**.
2.  Select **Advanced WIF Configuration**.
3.  Enter the **WIF Configuration String** provided by your organization’s administrator.
4.  Complete sign-in through your federated identity provider.
5.  Select or self-assign a license from the License Selector.

info**Note**: If the same email address exists across multiple identity providers, sign in with the identity that matches your Gemini Enterprise license. BYOID does not currently support **Agent Platform on Antigravity 2.0**.

## Application Default Credentials (ADC) in Antigravity CLI

For headless environments and automated terminal workflows, the **Antigravity CLI** supports authentication using Google Cloud Application Default Credentials (ADC).

### Setting Up ADC

1.  Generate local Application Default Credentials for your project using the Google Cloud SDK:

    content_copy

        gcloud auth application-default login --project {GCP_PROJECT}

2.  Verify that your credentials file exists. On Linux and macOS, the default path is:

    content_copy

        ~/.config/gcloud/application_default_credentials.json

3.  Enable ADC authentication by exporting the required environment variable:

    content_copy

        export AGY_ADC_AUTH=true

4.  To sign out of ADC, unset the environment variable and restart your terminal session:

    content_copy

        unset AGY_ADC_AUTH

info**ADC Limitations**: ADC sign-in is supported exclusively on the **Antigravity CLI**. When authenticating via ADC, models older than Gemini 3 Flash are not supported.

## Regional Endpoints & Capability Matrix

Antigravity CLI and Antigravity 2.0 support multi-region deployment endpoints to satisfy regional data residency requirements:

| Endpoint Region | Base Endpoint URI | Supported Capabilities |
|----|----|----|
| **Global** | `global` | Text Generation, Code Inference, Multimodal, Image Generation |
| **US Multi-Region** | `us` | Text Generation, Code Inference, Multimodal |
| **EU Multi-Region** | `eu` | Text Generation, Code Inference, Multimodal |

info**Note**: Image generation capabilities are currently available exclusively on **`global`** deployment endpoints.

For full endpoint specifications, consult the [Deployment Endpoints Documentation](https://docs.cloud.google.com/gemini-enterprise-agent-platform/resources/locations#global).

## Security & Governance

[manage_historyRequest & Response Loggingkeyboard_arrow_right](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/request-response-logging)

Audit model interactions and maintain enterprise compliance records for your Gemini Enterprise Agent Platform instance.

[lockVPC Service Controls (VPC-SC)keyboard_arrow_right](https://docs.cloud.google.com/gemini-enterprise-agent-platform/machine-learning/general/vpc-service-controls)

Enforce private networking security perimeters by adding the Agent Platform API to your VPC-SC perimeter.

## Troubleshooting & Diagnostics

### Common Sign-In & License Issues

- **No Licenses Appear During Setup**: Licenses are assigned by your organization’s Google Cloud administrator. If the License Selector is empty, contact your administrator to ensure your account has been granted access to a Gemini Enterprise Standard or Plus license.
- **Missing BYOID Sign-In Option**: Ensure you are running the latest release of **[Antigravity 2.0](/download)** or the **[Antigravity CLI](/docs/cli/install)**, as enterprise authentication and BYOID support are included natively in all recent releases.
- **Browser URL Allowlist Advisory**: When a browser URL allowlist is configured in admin controls, allowlisted URLs may still be blocked in Antigravity. Admin URL allowlists are currently being integrated and are not yet honored.

### Known Limitations

**BYOID / WIF login**:

- When signing in with the Advanced SSO option (BYOID / Workforce Identity Federation), a small number of users are unexpectedly logged out and must sign in again after restarting Antigravity 2.0 or the Antigravity CLI.
- Affected users must re-authenticate on restart.

### Important API Provisioning Advisory

warning**Enable Required APIs Before Purchasing Licenses**: New Gemini Enterprise license purchases can fail or fail to provision if the **Agent Platform API** (`aiplatform.googleapis.com`) is not enabled first. Enable the API in the Google Cloud Console and wait approximately 5 minutes for propagation before completing license purchases.

### Sharing Diagnostics with Support

When contacting Google Cloud Support, include the diagnostic log file from your most recent session:

- **Antigravity CLI (Linux and macOS)**:

  content_copy

      ~/.gemini/antigravity-cli/cli.log

- **Antigravity 2.0 (macOS)**:

  content_copy

      ~/Library/Logs/Antigravity/language_server.log

## What’s Next

- Explore supported model architectures in the [Models Guide](/docs/models).
- Learn more about enterprise privacy and compliance in [Security & Governance](#security--governance).
- Check the [Antigravity CLI Reference](/docs/cli/reference) for headless automation commands.
