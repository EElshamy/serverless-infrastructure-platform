export interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

export const seedCategories: SeedCategory[] = [
  { name: "DevOps", slug: "devops", description: "Culture, practices, and delivery pipelines that connect development and operations.", icon: "Workflow", color: "#38bdf8" },
  { name: "Linux", slug: "linux", description: "Shell, processes, permissions, systemd, and everything needed to run servers reliably.", icon: "Terminal", color: "#a3e635" },
  { name: "Git & GitHub", slug: "git-github", description: "Version control, collaboration workflows, code review, and repository automation.", icon: "GitBranch", color: "#f472b6" },
  { name: "Networking", slug: "networking", description: "TCP/IP, DNS, HTTP, load balancing, and practical network troubleshooting.", icon: "Network", color: "#818cf8" },
  { name: "Docker", slug: "docker", description: "Images, containers, volumes, networks, and reproducible local environments.", icon: "Container", color: "#22d3ee" },
  { name: "Kubernetes", slug: "kubernetes", description: "Cluster architecture, workloads, services, scaling, and operational troubleshooting.", icon: "Boxes", color: "#60a5fa" },
  { name: "AWS", slug: "aws", description: "Identity, compute, storage, networking, and cost-aware cloud architecture.", icon: "Cloud", color: "#fbbf24" },
  { name: "Terraform", slug: "terraform", description: "Declarative infrastructure, state management, modules, and safe automation.", icon: "Layers", color: "#c084fc" },
  { name: "CI/CD", slug: "ci-cd", description: "Automated testing, builds, artifact promotion, and progressive delivery.", icon: "GitMerge", color: "#34d399" },
  { name: "Monitoring", slug: "monitoring", description: "Metrics, logs, traces, dashboards, and alerts that make systems observable.", icon: "Activity", color: "#f87171" },
  { name: "Security", slug: "security", description: "Hardening, least privilege, patching, secrets, and incident-ready operations.", icon: "ShieldCheck", color: "#fb923c" },
  { name: "Serverless", slug: "serverless", description: "Event-driven functions, managed services, and cost-efficient architectures.", icon: "Zap", color: "#e879f9" },
];
