export interface SeedLesson {
  title: string;
  slug: string;
  description: string;
  content: string;
  codeExample: string | null;
  practicalInstructions: string;
  durationMinutes: number;
}

export interface SeedPath {
  title: string;
  slug: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  durationHours: number;
  objectives: string[];
  icon: string;
  color: string;
  sortOrder: number;
  lessons: SeedLesson[];
}

const md = (...lines: string[]) => lines.join("\n");

function lesson(
  title: string,
  slug: string,
  description: string,
  concepts: string[],
  language: string,
  code: string,
  practice: string,
  durationMinutes: number,
): SeedLesson {
  return {
    title,
    slug,
    description,
    content: md(
      "## Objective",
      description,
      "",
      "## Key concepts",
      ...concepts.map((item) => `- ${item}`),
      "",
      "## Example",
      `\`\`\`${language}`,
      code,
      "```",
      "",
      "## Expected result",
      practice,
      "",
      "Complete the practice steps in your own environment before moving to the next lesson. Record the commands you used so they become part of your personal runbook.",
    ),
    codeExample: code,
    practicalInstructions: practice,
    durationMinutes,
  };
}

export const seedPaths: SeedPath[] = [
  {
    title: "DevOps Fundamentals",
    slug: "devops-fundamentals",
    description: "Learn the delivery model behind modern DevOps: ownership, automation, measurement, and feedback loops.",
    difficulty: "beginner",
    durationHours: 8,
    objectives: [
      "Explain DevOps as a system of feedback loops",
      "Measure delivery with the four key metrics",
      "Automate a repeatable path from commit to staging",
      "Design a rollback plan before a release",
    ],
    icon: "Workflow",
    color: "#38bdf8",
    sortOrder: 1,
    lessons: [
      lesson("Delivery metrics that matter", "delivery-metrics-that-matter", "Understand lead time, deployment frequency, change failure rate, and restore time.", ["Lead time measures the path from commit to production", "Deployment frequency exposes batch size", "Change failure rate measures quality of releases", "Time to restore measures recovery speed"], "text", "Lead time for changes\nDeployment frequency\nChange failure rate\nTime to restore service", "Write these four metrics for your current team and identify which one needs attention first.", 15),
      lesson("Shared ownership and on-call", "shared-ownership-and-on-call", "Learn how teams own services from design through production support.", ["Ownership follows the service, not the department", "On-call rotations need clear escalation paths", "Every page should produce a follow-up action", "Blameless reviews improve future responses"], "text", "Incident -> acknowledge -> mitigate -> resolve -> learn", "Create a one-page on-call checklist with escalation contacts and the first three diagnostic commands.", 20),
      lesson("Automate the first path", "automate-the-first-path", "Build a minimal automated pipeline for one service.", ["Source control triggers every pipeline", "Checks must be deterministic", "Artifacts are versioned and immutable", "Staging mirrors production behavior"], "bash", "git status --short\nnpm test\nnpm run build\ndocker build -t academy/api:1.0 .", "Run the same sequence locally, then translate each step into a CI job.", 25),
      lesson("Rollbacks and progressive delivery", "rollbacks-and-progressive-delivery", "Reduce release risk with small batches and rehearsed rollback.", ["Blue-green and canary change exposure", "Feature flags separate deploy from release", "Rollback must be tested, not assumed", "Observability decides when to stop a rollout"], "bash", "kubectl rollout undo deployment/api\ncurl -fsS https://api.example.com/health", "Document the exact rollback command for one service and test it in staging.", 20),
    ],
  },
  {
    title: "Linux Administration",
    slug: "linux-administration",
    description: "Operate Linux servers confidently: permissions, processes, services, logs, and networking.",
    difficulty: "beginner",
    durationHours: 12,
    objectives: [
      "Manage users, groups, and file permissions safely",
      "Inspect and control processes and systemd services",
      "Find answers quickly in the journal and log files",
      "Verify connectivity with Linux networking tools",
    ],
    icon: "Terminal",
    color: "#a3e635",
    sortOrder: 2,
    lessons: [
      lesson("Users, groups, and permissions", "users-groups-and-permissions", "Read and modify Linux permissions without weakening a server.", ["Each file has owner, group, and other permissions", "Use groups to grant shared access", "sudo limits administrative exposure", "Extra privileges should be temporary"], "bash", "id deploy\nls -l /srv/app\nchmod 750 /srv/app\nchown deploy:deploy /srv/app", "Create a deploy user, place it in a group, and grant access to a directory using the group rather than world permissions.", 20),
      lesson("Processes and systemd", "processes-and-systemd", "Find resource-hungry processes and manage long-running services.", ["ps and top expose process state and usage", "SIGTERM allows graceful shutdown", "systemd restarts and orders services", "The journal records service output"], "bash", "ps -eo pid,user,pcpu,pmem,cmd --sort=-pcpu | head\njournalctl -u api --since '10 minutes ago'\nsystemctl restart api", "Inspect the busiest process on a test machine, then review logs for a systemd service.", 20),
      lesson("Logs and journald", "logs-and-journald", "Search structured logs efficiently during an incident.", ["journald adds metadata to service output", "Boot IDs separate log sessions", "grep and filters narrow large volumes", "Forward logs off the host for retention"], "bash", "journalctl -u nginx --since today --no-pager\njournalctl -u nginx -f\njournalctl --disk-usage", "Find the last five error lines for a service and explain the fields in each entry.", 15),
      lesson("Networking commands", "networking-commands", "Verify addresses, routes, listening ports, and connections.", ["ip replaces deprecated ifconfig", "ss shows sockets and owning processes", "curl verifies application behavior", "dig isolates DNS problems"], "bash", "ip addr\nip route get 8.8.8.8\nss -tulpn\ncurl -v https://example.com", "From one host, resolve a name, check the route, confirm the port, and perform an HTTP request.", 20),
    ],
  },
  {
    title: "Git and GitHub",
    slug: "git-and-github",
    description: "Master collaboration workflows, history hygiene, code review, and repository automation.",
    difficulty: "beginner",
    durationHours: 10,
    objectives: [
      "Create short-lived branches with clear intent",
      "Clean history with focused rebase and commits",
      "Run reviews that catch design problems early",
      "Automate checks with GitHub Actions",
    ],
    icon: "GitBranch",
    color: "#f472b6",
    sortOrder: 3,
    lessons: [
      lesson("Branching for small batches", "branching-for-small-batches", "Keep branches short-lived and main deployable.", ["Branch from an up-to-date default branch", "Small changes are easier to review", "Feature flags hide incomplete work", "Delete branches after merge"], "bash", "git switch main\ngit pull --ff-only\ngit switch -c fix/timeout-config", "Create a branch for a small documentation change and open a pull request against main.", 15),
      lesson("Rebase and commit hygiene", "rebase-and-commit-hygiene", "Produce a readable history with focused commits.", ["Rebase replays local work onto a new base", "Interactive rebase fixes commit order and messages", "Never rebase shared commits", "Squash merges keep main linear"], "bash", "git fetch origin\ngit rebase origin/main\ngit push --force-with-lease", "Practice a rebase on a throwaway branch and inspect the resulting graph.", 20),
      lesson("Effective pull request reviews", "effective-pull-request-reviews", "Review for correctness, design, and operability.", ["Describe intent in the pull request body", "Automated checks handle mechanical issues", "Reviewers focus on behavior and tradeoffs", "Small pull requests get better feedback"], "text", "What changes?\nWhy is it needed?\nHow was it tested?\nWhat is the rollback path?", "Review one pull request using the four questions and leave an actionable comment.", 15),
      lesson("GitHub Actions basics", "github-actions-basics", "Automate checks on every pull request.", ["Workflows live in .github/workflows", "Permissions should be minimal", "Caches speed dependency installs", "Required checks protect the default branch"], "yaml", "name: ci\non: [pull_request]\npermissions:\n  contents: read\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test", "Add a workflow that runs your project tests and require it before merge.", 25),
    ],
  },
  {
    title: "Docker",
    slug: "docker",
    description: "Build reproducible images, manage container lifecycle, and connect services with networks and volumes.",
    difficulty: "beginner",
    durationHours: 14,
    objectives: [
      "Write cache-friendly multi-stage Dockerfiles",
      "Run and inspect containers safely",
      "Persist data with volumes and isolate traffic with networks",
      "Compose a local multi-service environment",
    ],
    icon: "Container",
    color: "#22d3ee",
    sortOrder: 4,
    lessons: [
      lesson("Images and layers", "images-and-layers", "Understand how instructions become reusable image layers.", ["Each instruction creates a layer", "Dependency manifests should be copied first", "Multi-stage builds remove build tools", "Non-root runtime users reduce risk"], "dockerfile", "FROM node:22-alpine AS build\nWORKDIR /app\nCOPY package.json pnpm-lock.yaml ./\nRUN corepack enable && pnpm install --frozen-lockfile\nCOPY . .\nRUN pnpm build", "Build an image, run docker history, and identify which layer invalidates the build cache.", 25),
      lesson("Container lifecycle", "container-lifecycle", "Start, inspect, and stop containers predictably.", ["Containers are running instances of images", "Environment variables configure behavior", "Logs and exec help diagnose state", "Health checks express readiness"], "bash", "docker run -d --name api -p 4000:4000 academy/api:1.0\ndocker ps\ndocker logs -f api\ndocker stop api && docker rm api", "Run a container from your image and inspect its logs, environment, and resource usage.", 20),
      lesson("Volumes and networks", "volumes-and-networks", "Persist state and communicate between containers.", ["Volumes survive container removal", "Bridge networks isolate service traffic", "Service names resolve through DNS", "Bind mounts are useful for local development"], "bash", "docker network create academy\ndocker volume create academy-data\ndocker run -d --net academy --name db -v academy-data:/var/lib/postgresql/data postgres:16-alpine", "Create a network and volume, then start two containers that communicate by service name.", 20),
      lesson("Docker Compose", "docker-compose", "Describe a full local stack in one declarative file.", ["Compose maps services, networks, and volumes", "Health checks control startup order", "Environment files keep secrets out of YAML", "The same file supports local and CI environments"], "yaml", "services:\n  api:\n    build: ./apps/api\n    ports:\n      - '4000:4000'\n    depends_on:\n      postgres:\n        condition: service_healthy", "Create a compose file for an application and its database, then verify it starts from a clean state.", 25),
    ],
  },
  {
    title: "Kubernetes",
    slug: "kubernetes",
    description: "Run resilient workloads with Deployments, Services, probes, resources, and controlled rollouts.",
    difficulty: "intermediate",
    durationHours: 18,
    objectives: [
      "Describe desired state with manifests",
      "Expose workloads through stable Services",
      "Configure probes and resource requests",
      "Perform and verify safe rollouts",
    ],
    icon: "Boxes",
    color: "#60a5fa",
    sortOrder: 5,
    lessons: [
      lesson("Pods and Deployments", "pods-and-deployments", "Model replicas with a Deployment instead of bare pods.", ["Pods are ephemeral and replaceable", "Deployments own ReplicaSets", "Labels connect controllers to pods", "Desired state is declarative"], "yaml", "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: api\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: api", "Apply a Deployment with two replicas and confirm the controller replaces a deleted pod.", 25),
      lesson("Services and Ingress", "services-and-ingress", "Provide stable networking for changing pods.", ["ClusterIP provides internal load balancing", "Selectors target pod labels", "Ingress maps hostnames and paths", "Endpoints track ready pods"], "yaml", "apiVersion: v1\nkind: Service\nmetadata:\n  name: api\nspec:\n  selector:\n    app: api\n  ports:\n    - port: 80\n      targetPort: 4000", "Create a Service for a Deployment and call it from another pod using its DNS name.", 25),
      lesson("Probes and resources", "probes-and-resources", "Keep workloads stable under real traffic.", ["Readiness gates traffic", "Liveness restarts stuck processes", "Requests guide scheduling", "Limits prevent noisy neighbors"], "yaml", "readinessProbe:\n  httpGet:\n    path: /health\n    port: 4000\nresources:\n  requests:\n    cpu: 100m\n    memory: 128Mi", "Add probes and resource requests to a Deployment and inspect the resulting pod events.", 20),
      lesson("Rollouts and troubleshooting", "rollouts-and-troubleshooting", "Release changes safely and diagnose failures.", ["Rolling updates replace pods gradually", "Rollout status reports progress", "describe explains scheduling failures", "Logs reveal application errors"], "bash", "kubectl set image deployment/api api=academy/api:1.4.1\nkubectl rollout status deployment/api\nkubectl describe pod api-xyz", "Perform a rollout in a test cluster, then force a failure and practice the rollback.", 25),
    ],
  },
  {
    title: "AWS Cloud",
    slug: "aws-cloud",
    description: "Build a secure AWS foundation with IAM, compute, storage, and visibility into cost.",
    difficulty: "intermediate",
    durationHours: 16,
    objectives: [
      "Apply least privilege with IAM roles and policies",
      "Run resilient compute with instance profiles",
      "Store and serve objects with S3 safely",
      "Read basic cost and usage reports",
    ],
    icon: "Cloud",
    color: "#fbbf24",
    sortOrder: 6,
    lessons: [
      lesson("IAM roles and policies", "iam-roles-and-policies", "Grant precise permissions to humans and workloads.", ["Attach policies to roles, not users", "Scope actions and resources", "Conditions add context to access", "Temporary credentials reduce long-term risk"], "json", "{\n  \"Effect\": \"Allow\",\n  \"Action\": [\"s3:GetObject\"],\n  \"Resource\": \"arn:aws:s3:::academy-assets/public/*\"\n}", "Create a test role with one scoped permission and verify denial for an unapproved action.", 25),
      lesson("Resilient compute", "resilient-compute", "Run instances across failure domains with health checks.", ["Availability zones are independent failure domains", "Launch templates standardize configuration", "Auto scaling groups replace unhealthy instances", "User data should be minimal and auditable"], "bash", "aws autoscaling describe-auto-scaling-groups --query 'AutoScalingGroups[].MinSize'", "Review an auto scaling group configuration and identify its health check and subnet coverage.", 20),
      lesson("S3 and cost basics", "s3-and-cost-basics", "Store objects securely and understand spend.", ["Block public access by default", "Encryption and versioning protect data", "Lifecycle rules move objects to cheaper tiers", "Cost tags attribute spend to owners"], "bash", "aws s3api get-bucket-encryption --bucket academy-assets\naws ce get-cost-and-usage --time-period Start=2026-11-01,End=2026-11-25 --granularity MONTHLY --metrics BlendedCost", "Inspect encryption settings on a bucket and create one cost tag for an existing resource.", 20),
    ],
  },
  {
    title: "Terraform",
    slug: "terraform",
    description: "Provision infrastructure declaratively with safe plans, protected state, and reusable modules.",
    difficulty: "intermediate",
    durationHours: 16,
    objectives: [
      "Run init, validate, plan, and apply in the right order",
      "Protect and inspect remote state",
      "Build versioned modules with clear interfaces",
      "Separate environments without copying code",
    ],
    icon: "Layers",
    color: "#c084fc",
    sortOrder: 7,
    lessons: [
      lesson("Init, validate, plan, apply", "init-validate-plan-apply", "Follow a reviewable Terraform workflow.", ["init installs providers and configures the backend", "validate catches configuration errors", "plan shows the exact proposed changes", "apply consumes the reviewed plan file"], "bash", "terraform init\nterraform validate\nterraform plan -out=tfplan\nterraform apply tfplan", "Run the full workflow on a local sandbox configuration and read the plan line by line.", 20),
      lesson("Protecting remote state", "protecting-remote-state", "Store state securely and recover from mistakes.", ["Remote state enables team collaboration", "Encryption and versioning are mandatory", "State locking prevents concurrent writes", "Never expose state in CI logs"], "hcl", "terraform {\n  backend \"s3\" {\n    bucket  = \"academy-tf-state\"\n    key     = \"prod/network.tfstate\"\n    encrypt = true\n  }\n}", "Configure a remote backend in a sandbox account and verify versioning is enabled.", 25),
      lesson("Modules and interfaces", "modules-and-interfaces", "Package infrastructure into reusable units.", ["Modules own a coherent resource boundary", "Variables define the public contract", "Outputs expose only necessary values", "Pin module versions"], "hcl", "module \"network\" {\n  source = \"git::https://example.infra/modules/network?ref=2.3.0\"\n  cidr   = \"10.20.0.0/16\"\n}", "Refactor two duplicated resource blocks into a local module with explicit inputs and outputs.", 25),
      lesson("Environments and workspaces", "environments-and-workspaces", "Manage dev and production without drift.", ["Separate state per environment", "Use variable files for differences", "Promote module versions, not hand edits", "Restrict production apply permissions"], "bash", "terraform workspace select prod\nterraform plan -var-file=prod.tfvars", "Create two workspaces, apply the same configuration, and compare their plans.", 20),
    ],
  },
  {
    title: "CI/CD",
    slug: "ci-cd",
    description: "Turn source changes into safe, repeatable releases using pipelines, artifacts, and environments.",
    difficulty: "intermediate",
    durationHours: 12,
    objectives: [
      "Design CI checks that fail fast",
      "Build once and promote the same artifact",
      "Protect environments with approvals",
      "Observe deployments and roll back quickly",
    ],
    icon: "GitMerge",
    color: "#34d399",
    sortOrder: 8,
    lessons: [
      lesson("Pipeline design", "pipeline-design", "Structure stages around risk and speed.", ["Fast checks run first", "Tests produce evidence, not noise", "Artifacts are immutable and versioned", "Deployments are separate from builds"], "text", "lint -> typecheck -> unit tests -> build -> integration tests -> publish artifact", "Sketch a pipeline for one service and place each existing check at the earliest useful stage.", 15),
      lesson("GitHub Actions workflows", "github-actions-workflows", "Implement CI and deployment workflows with minimal permissions.", ["Workflow permissions default to read-only", "Caches reduce repeated work", "Environments scope secrets and approvals", "Concurrency cancels superseded runs"], "yaml", "concurrency:\n  group: deploy-${{ github.ref }}\n  cancel-in-progress: true\npermissions:\n  contents: read", "Add concurrency control to a workflow and verify that a newer run cancels an older one.", 25),
      lesson("Artifact promotion", "artifact-promotion", "Deploy the exact artifact that passed testing.", ["Build output gets a unique version", "Registries store immutable artifacts", "Staging and production consume the same version", "Metadata links commit to artifact"], "bash", "docker build -t academy/api:${GIT_SHA} .\ndocker push academy/api:${GIT_SHA}\nkubectl set image deployment/api api=academy/api:${GIT_SHA}", "Trace one artifact version from CI logs to a deployment and confirm the commit SHA matches.", 20),
    ],
  },
  {
    title: "Monitoring and Observability",
    slug: "monitoring-and-observability",
    description: "Collect metrics, logs, and traces, then turn them into dashboards and actionable alerts.",
    difficulty: "intermediate",
    durationHours: 15,
    objectives: [
      "Write useful PromQL queries",
      "Build dashboards around user journeys",
      "Centralize logs with searchable context",
      "Alert on symptoms with clear runbooks",
    ],
    icon: "Activity",
    color: "#f87171",
    sortOrder: 9,
    lessons: [
      lesson("Metrics and PromQL", "metrics-and-promql", "Query time series data to answer operational questions.", ["Counters accumulate and use rate", "Gauges represent current values", "Histograms expose latency distribution", "Label cardinality affects cost"], "promql", "sum by (status) (rate(http_requests_total[5m]))\nhistogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))", "Write one query for request rate and one for p95 latency against a metrics endpoint.", 25),
      lesson("Grafana dashboards", "grafana-dashboards", "Build dashboards that support decisions during incidents.", ["Start from a user-facing question", "Use variables for environment and service", "Show error budget alongside latency", "Avoid panels nobody reads"], "text", "Availability -> request rate -> error rate -> p95 latency -> saturation", "Create a dashboard with four panels and explain what action each panel supports.", 20),
      lesson("Centralized logging", "centralized-logging", "Correlate logs with requests and deployments.", ["Structured JSON is easier to query", "Correlation IDs connect services", "Retention must match compliance needs", "Secrets must never reach logs"], "json", "{\"level\":\"info\",\"msg\":\"request complete\",\"requestId\":\"req-42\",\"durationMs\":83}", "Inspect one structured log entry and identify the fields needed to trace a request.", 15),
      lesson("Alerting and SLOs", "alerting-and-slos", "Page on symptoms and track error budgets.", ["SLOs define expected user experience", "Error budgets guide release decisions", "Alerts need duration and ownership", "Every page links to a runbook"], "yaml", "- alert: ApiHighErrorRate\n  expr: sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])) > 0.05\n  for: 10m", "Write one symptom-based alert with a severity, duration, and runbook link.", 25),
    ],
  },
  {
    title: "Serverless Architecture",
    slug: "serverless-architecture",
    description: "Design event-driven systems with Lambda, API Gateway, managed storage, and idempotent handlers.",
    difficulty: "advanced",
    durationHours: 14,
    objectives: [
      "Write small, testable Lambda handlers",
      "Expose functions through API Gateway",
      "Make retries safe with idempotency",
      "Measure cost and cold-start behavior",
    ],
    icon: "Zap",
    color: "#e879f9",
    sortOrder: 10,
    lessons: [
      lesson("Lambda handler structure", "lambda-handler-structure", "Separate transport concerns from business logic.", ["Handlers parse input and format output", "SDK clients initialize outside handlers", "Validation happens at the boundary", "Errors are explicit and safe"], "ts", "export async function handler(event: APIGatewayProxyEvent) {\n  const input = parse(event);\n  if (!input.ok) return badRequest(input.error);\n  return json(200, await service.handle(input.value));\n}", "Refactor one function so the handler contains no business rules and the service is unit tested.", 25),
      lesson("API Gateway integration", "api-gateway-integration", "Expose functions with validation and clear responses.", ["REST and HTTP APIs have different contracts", "Request validation rejects bad input early", "CORS must list explicit origins", "Authorizers centralize identity"], "json", "{\n  \"statusCode\": 200,\n  \"headers\": { \"content-type\": \"application/json\" },\n  \"body\": \"{\\\"ok\\\":true}\"\n}", "Invoke a Lambda through API Gateway and inspect headers, status code, and body shape.", 20),
      lesson("Idempotency and retries", "idempotency-and-retries", "Handle duplicate events without duplicate side effects.", ["Asynchronous invocations retry", "Idempotency keys prevent duplicates", "Dead-letter queues capture failures", "Partial batch responses reduce redelivery"], "ts", "const key = event.requestContext.requestId;\nif (await seen(key)) return existingResult(key);\nconst result = await process(event);\nawait remember(key, result);", "Send the same event twice to a test function and verify that only one record is created.", 25),
    ],
  },
];
