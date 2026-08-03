import React, { useState } from "react";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  Users, 
  UserCheck, 
  Settings, 
  Check, 
  X, 
  Sliders, 
  FileCode, 
  Play, 
  Copy, 
  RefreshCw, 
  Building2, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Plus, 
  Search, 
  Terminal, 
  ChevronRight,
  Eye,
  GitBranch,
  Layers,
  Unlock,
  Filter,
  Sparkles,
  RotateCcw,
  Zap,
  SlidersHorizontal
} from "lucide-react";
import { TenantRole, PermissionDefinition, TenantUser, RolePermissionMapping } from "../types";

export const AccessControlPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'users' | 'simulator' | 'rego'>('matrix');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'project-config' | 'deployment-settings'>('all');
  const [selectedResourceType, setSelectedResourceType] = useState<string>('all');
  const [matrixSearchQuery, setMatrixSearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Custom Permission Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newPermCode, setNewPermCode] = useState<string>('');
  const [newPermName, setNewPermName] = useState<string>('');
  const [newPermDesc, setNewPermDesc] = useState<string>('');
  const [newPermCategory, setNewPermCategory] = useState<'project-config' | 'deployment-settings'>('project-config');
  const [newPermResource, setNewPermResource] = useState<'Deploy' | 'Modify Rules' | 'Access Logs' | 'Project Config' | 'Security & Patching'>('Deploy');
  const [newPermRisk, setNewPermRisk] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');

  // Permission definitions
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([
    // Project Configuration Category
    {
      id: "perm-01",
      code: "config:read",
      name: "View Project Configuration",
      description: "Read access to pipeline variables, region, VPC CIDRs, and infrastructure topology.",
      category: "project-config",
      resourceType: "Project Config",
      riskLevel: "Low",
      defaultRoles: ["Admin", "Auditor", "Developer"]
    },
    {
      id: "perm-02",
      code: "config:write",
      name: "Modify Project Configuration",
      description: "Edit environment variables, VPC settings, instance counts, and node cluster configs.",
      category: "project-config",
      resourceType: "Modify Rules",
      riskLevel: "High",
      defaultRoles: ["Admin", "Developer"]
    },
    {
      id: "perm-03",
      code: "config:export_import",
      name: "Export/Import Package JSON",
      description: "Download or upload project configuration state and Sigma detection rules as JSON package.",
      category: "project-config",
      resourceType: "Project Config",
      riskLevel: "Medium",
      defaultRoles: ["Admin"]
    },
    {
      id: "perm-04",
      code: "config:sso_manage",
      name: "Manage Multi-Tenant SSO & Identity",
      description: "Configure OIDC Okta, Azure AD SAML2 parameters, and tenant isolation policies.",
      category: "project-config",
      resourceType: "Modify Rules",
      riskLevel: "Critical",
      defaultRoles: ["Admin"]
    },
    {
      id: "perm-05",
      code: "config:audit_view",
      name: "View Audit & Compliance Logs",
      description: "Inspect SOC2/CIS benchmark compliance audit logs, policy change histories, and access logs.",
      category: "project-config",
      resourceType: "Access Logs",
      riskLevel: "Low",
      defaultRoles: ["Admin", "Auditor"]
    },

    // Deployment Settings Category
    {
      id: "perm-06",
      code: "deploy:trigger_dev",
      name: "Trigger Staging/Dev Deployments",
      description: "Initiate CI/CD pipeline builds and deploy services to Staging/Development environments.",
      category: "deployment-settings",
      resourceType: "Deploy",
      riskLevel: "Medium",
      defaultRoles: ["Admin", "Developer"]
    },
    {
      id: "perm-07",
      code: "deploy:trigger_prod",
      name: "Promote & Deploy to Production",
      description: "Execute production deployment pipelines, apply terraform changes, and release service containers.",
      category: "deployment-settings",
      resourceType: "Deploy",
      riskLevel: "Critical",
      defaultRoles: ["Admin"]
    },
    {
      id: "perm-08",
      code: "deploy:approve_gate",
      name: "Approve Deployment Gate",
      description: "Approve or reject manual gate checks and AST scan findings before production release.",
      category: "deployment-settings",
      resourceType: "Modify Rules",
      riskLevel: "High",
      defaultRoles: ["Admin", "Auditor"]
    },
    {
      id: "perm-09",
      code: "deploy:rollback",
      name: "Execute Service Rollback",
      description: "Revert production releases to previous stable container image or infrastructure state.",
      category: "deployment-settings",
      resourceType: "Deploy",
      riskLevel: "High",
      defaultRoles: ["Admin"]
    },
    {
      id: "perm-10",
      code: "deploy:ast_scan_run",
      name: "Trigger Checkov AST Scans",
      description: "Run SAST/DAST AST static security checks and IaC misconfiguration scanners.",
      category: "deployment-settings",
      resourceType: "Access Logs",
      riskLevel: "Low",
      defaultRoles: ["Admin", "Auditor", "Developer"]
    },
    {
      id: "perm-11",
      code: "deploy:patch_rollout",
      name: "Schedule Endpoint Patch Rollout",
      description: "Schedule and execute BigFix-inspired automated OS/container patch rollouts.",
      category: "deployment-settings",
      resourceType: "Security & Patching",
      riskLevel: "High",
      defaultRoles: ["Admin"]
    }
  ]);

  // Role Mappings state
  const [roleMappings, setRoleMappings] = useState<Record<TenantRole, string[]>>({
    Admin: permissions.filter(p => p.defaultRoles.includes("Admin")).map(p => p.code),
    Auditor: permissions.filter(p => p.defaultRoles.includes("Auditor")).map(p => p.code),
    Developer: permissions.filter(p => p.defaultRoles.includes("Developer")).map(p => p.code)
  });

  // User roster state
  const [users, setUsers] = useState<TenantUser[]>([
    {
      id: "usr-101",
      tenantId: "tenant-01",
      tenantName: "Acme Global Banking Corp",
      name: "Alex Morgan",
      email: "alex.morgan@acmebanking.com",
      role: "Admin",
      status: "active",
      lastActive: "2 mins ago",
      mfaEnabled: true
    },
    {
      id: "usr-102",
      tenantId: "tenant-01",
      tenantName: "Acme Global Banking Corp",
      name: "Elena Rostova",
      email: "elena.r@acmebanking.com",
      role: "Auditor",
      status: "active",
      lastActive: "1 hour ago",
      mfaEnabled: true
    },
    {
      id: "usr-103",
      tenantId: "tenant-01",
      tenantName: "Acme Global Banking Corp",
      name: "Marcus Chen",
      email: "m.chen@acmebanking.com",
      role: "Developer",
      status: "active",
      lastActive: "15 mins ago",
      mfaEnabled: false
    },
    {
      id: "usr-104",
      tenantId: "tenant-02",
      tenantName: "AeroTech Defense Systems",
      name: "Sarah Jenkins",
      email: "s.jenkins@aerotech-gov.com",
      role: "Admin",
      status: "active",
      lastActive: "Just now",
      mfaEnabled: true
    },
    {
      id: "usr-105",
      tenantId: "tenant-02",
      tenantName: "AeroTech Defense Systems",
      name: "David Vance",
      email: "d.vance@aerotech-gov.com",
      role: "Developer",
      status: "active",
      lastActive: "3 hours ago",
      mfaEnabled: true
    },
    {
      id: "usr-106",
      tenantId: "tenant-03",
      tenantName: "BioPharma Health EU",
      name: "Dr. Aris Thorne",
      email: "a.thorne@biopharma.eu",
      role: "Auditor",
      status: "active",
      lastActive: "Yesterday",
      mfaEnabled: true
    }
  ]);

  const [searchTerm, setSearchTerm] = useState<string>("");

  // Simulator state
  const [simUserEmail, setSimUserEmail] = useState<string>(users[2].email);
  const [simAction, setSimAction] = useState<string>("deploy:trigger_prod");
  const [simEnvironment, setSimEnvironment] = useState<'dev' | 'staging' | 'prod'>("prod");
  const [simResult, setSimResult] = useState<{
    allowed: boolean;
    reason: string;
    evaluatedUser: TenantUser;
    requiredPerm: string;
    evaluatedAt: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle permission mapping
  const togglePermission = (role: TenantRole, permCode: string) => {
    setRoleMappings(prev => {
      const current = prev[role] || [];
      const updated = current.includes(permCode)
        ? current.filter(c => c !== permCode)
        : [...current, permCode];
      return { ...prev, [role]: updated };
    });
    showToast(`Updated '${permCode}' permission for role ${role}`);
  };

  // Bulk actions for matrix
  const bulkGrantAll = (role: TenantRole) => {
    const allCodes = permissions.map(p => p.code);
    setRoleMappings(prev => ({ ...prev, [role]: allCodes }));
    showToast(`Granted ALL ${allCodes.length} permissions to ${role}`);
  };

  const bulkRevokeAll = (role: TenantRole) => {
    setRoleMappings(prev => ({ ...prev, [role]: [] }));
    showToast(`Revoked ALL permissions for ${role}`);
  };

  const resetRoleDefaults = (role: TenantRole) => {
    const defaultCodes = permissions.filter(p => p.defaultRoles.includes(role)).map(p => p.code);
    setRoleMappings(prev => ({ ...prev, [role]: defaultCodes }));
    showToast(`Reset ${role} permissions to default matrix policy`);
  };

  // Preset policies
  const applyPresetSOC2 = () => {
    setRoleMappings({
      Admin: permissions.map(p => p.code),
      Auditor: permissions.filter(p => p.resourceType === 'Access Logs' || p.code === 'deploy:approve_gate' || p.code === 'config:read').map(p => p.code),
      Developer: permissions.filter(p => p.code === 'config:read' || p.code === 'deploy:trigger_dev' || p.code === 'deploy:ast_scan_run').map(p => p.code)
    });
    showToast("Applied 'SOC2 Compliance & Least Privilege' preset policy across all roles");
  };

  const applyPresetDeveloperSandbox = () => {
    setRoleMappings({
      Admin: permissions.map(p => p.code),
      Auditor: permissions.filter(p => p.defaultRoles.includes('Auditor')).map(p => p.code),
      Developer: permissions.filter(p => p.code !== 'deploy:trigger_prod' && p.code !== 'config:sso_manage').map(p => p.code)
    });
    showToast("Applied 'Unblocked Developer Sandbox' preset policy");
  };

  const handleCreateCustomPermission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermCode || !newPermName) {
      showToast("Please provide a permission code and name.");
      return;
    }

    const formattedCode = newPermCode.trim().toLowerCase().replace(/\s+/g, '_');
    if (permissions.some(p => p.code === formattedCode)) {
      showToast(`Permission code '${formattedCode}' already exists!`);
      return;
    }

    const newPerm: PermissionDefinition = {
      id: `perm-${Date.now()}`,
      code: formattedCode,
      name: newPermName,
      description: newPermDesc || "Custom administrator defined permission policy.",
      category: newPermCategory,
      resourceType: newPermResource,
      riskLevel: newPermRisk,
      defaultRoles: ["Admin"]
    };

    setPermissions(prev => [...prev, newPerm]);
    setRoleMappings(prev => ({
      ...prev,
      Admin: [...prev.Admin, formattedCode]
    }));

    setIsAddModalOpen(false);
    setNewPermCode('');
    setNewPermName('');
    setNewPermDesc('');
    showToast(`Added new permission '${formattedCode}' [${newPermResource}]`);
  };

  // Change user role
  const handleUserRoleChange = (userId: string, newRole: TenantRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    showToast(`Updated user role to ${newRole}`);
  };

  // Run Simulator
  const handleRunSimulator = () => {
    const user = users.find(u => u.email === simUserEmail) || users[0];
    const userRole = user.role;
    const userPerms = roleMappings[userRole] || [];
    const hasPerm = userPerms.includes(simAction);

    setSimResult({
      allowed: hasPerm,
      reason: hasPerm 
        ? `Access GRANTED: Role '${userRole}' holds required permission code '${simAction}' for environment '${simEnvironment}'.`
        : `Access DENIED: Role '${userRole}' lacks permission code '${simAction}'. Required role: Admin or explicit grant.`,
      evaluatedUser: user,
      requiredPerm: simAction,
      evaluatedAt: new Date().toLocaleTimeString()
    });
  };

  const filteredPermissions = permissions.filter(p => {
    // Category filter
    if (selectedCategory === "project-config" && p.category !== "project-config") return false;
    if (selectedCategory === "deployment-settings" && p.category !== "deployment-settings") return false;

    // Resource type filter
    if (selectedResourceType !== 'all' && p.resourceType !== selectedResourceType) return false;

    // Search query filter
    if (matrixSearchQuery) {
      const q = matrixSearchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchRes = p.resourceType?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchDesc && !matchRes) return false;
    }

    return true;
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateRegoPolicy = () => {
    return `# Open Policy Agent (OPA) Multi-Tenant Access Control Policy
package devsecops.access_control

import future.keywords.in

default allow = false

# Role Permission Mappings
role_permissions := {
  "Admin": [${roleMappings.Admin.map(p => `"${p}"`).join(", ")}],
  "Auditor": [${roleMappings.Auditor.map(p => `"${p}"`).join(", ")}],
  "Developer": [${roleMappings.Developer.map(p => `"${p}"`).join(", ")}]
}

# Allow evaluation rule
allow {
  # 1. Enforce active tenant match
  input.user.tenant_id == input.resource.tenant_id

  # 2. Extract user role and permission
  user_role := input.user.role
  required_permission := input.action.permission_code

  # 3. Check if required permission exists in user's role array
  required_permission in role_permissions[user_role]
}

# Special Rule: Block production deployments for Developers
deny[msg] {
  input.action.permission_code == "deploy:trigger_prod"
  input.user.role == "Developer"
  msg := sprintf("Role Developer is strictly prohibited from direct production deployment in tenant %v", [input.user.tenant_id])
}
`;
  };

  const copyRegoCode = () => {
    navigator.clipboard.writeText(generateRegoPolicy());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Resource badge color helper
  const getResourceBadgeStyle = (resourceType?: string) => {
    switch (resourceType) {
      case 'Deploy':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'Modify Rules':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'Access Logs':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'Project Config':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'Security & Patching':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getRiskBadgeStyle = (risk?: string) => {
    switch (risk) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Low':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in pb-12">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-800 border border-indigo-500/80 text-indigo-200 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-indigo-600/90 text-white font-bold text-xs rounded-full uppercase tracking-wider shadow-md">
                Multi-Tenant RBAC / ABAC
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-md">
                OPA Rego Policy Engine Active
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
              Enterprise Access Control Panel
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Define multi-tenant roles (<span className="text-amber-300 font-semibold font-mono">Admin</span>, <span className="text-cyan-300 font-semibold font-mono">Auditor</span>, <span className="text-purple-300 font-semibold font-mono">Developer</span>) and map granular permissions for specific resources (<span className="text-amber-300 font-mono">Deploy</span>, <span className="text-purple-300 font-mono">Modify Rules</span>, <span className="text-cyan-300 font-mono">Access Logs</span>, <span className="text-blue-300 font-mono">Project Config</span>) across isolated tenant organizations.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex flex-col border-r border-slate-800 pr-4">
              <span className="text-slate-400 font-sans font-medium">Configured Roles</span>
              <span className="text-indigo-300 font-bold mt-0.5">3 Primary Roles</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-sans font-medium">Granular Permissions</span>
              <span className="text-emerald-400 font-bold mt-0.5">{permissions.length} Active Codes</span>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Visual Permission Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tenant Users & Role Assignments</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>Live Access Gate Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('rego')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'rego'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <FileCode className="w-4 h-4 text-amber-400" />
            <span>OPA Rego Policy Export</span>
          </button>
        </div>
      </div>

      {/* ROLE OVERVIEW SUMMARY CARDS WITH RESOURCE STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Admin Card */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-bold font-mono text-xs rounded border border-amber-500/40 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Admin Role
            </span>
            <span className="text-xs text-slate-400 font-mono">Full Control</span>
          </div>
          <h3 className="font-bold text-white text-base">Tenant Platform Administrator</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Unrestricted access to project configuration, environment variables, multi-tenant SSO, and production deployment releases.
          </p>
          
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Permissions Granted</span>
              <span className="text-amber-300 font-bold">{roleMappings.Admin.length} / {permissions.length} ({Math.round((roleMappings.Admin.length / (permissions.length || 1)) * 100)}%)</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300" 
                style={{ width: `${(roleMappings.Admin.length / (permissions.length || 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
            <button
              onClick={() => resetRoleDefaults("Admin")}
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Admin
            </button>
            <span>Assigned Users: <strong>2</strong></span>
          </div>
        </div>

        {/* Auditor Card */}
        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-5 relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 font-bold font-mono text-xs rounded border border-cyan-500/40 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Auditor Role
            </span>
            <span className="text-xs text-slate-400 font-mono">Compliance & Governance</span>
          </div>
          <h3 className="font-bold text-white text-base">Security & Compliance Auditor</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Read-only access to configs, audit logs, and AST security scans. Can approve deployment gate checks but cannot trigger releases.
          </p>
          
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Permissions Granted</span>
              <span className="text-cyan-300 font-bold">{roleMappings.Auditor.length} / {permissions.length} ({Math.round((roleMappings.Auditor.length / (permissions.length || 1)) * 100)}%)</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all duration-300" 
                style={{ width: `${(roleMappings.Auditor.length / (permissions.length || 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
            <button
              onClick={() => resetRoleDefaults("Auditor")}
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Auditor
            </button>
            <span>Assigned Users: <strong>2</strong></span>
          </div>
        </div>

        {/* Developer Card */}
        <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-5 relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 font-bold font-mono text-xs rounded border border-purple-500/40 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5" /> Developer Role
            </span>
            <span className="text-xs text-slate-400 font-mono">Engineering & Staging</span>
          </div>
          <h3 className="font-bold text-white text-base">Application & Pipeline Developer</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Full write access to staging configs and dev build pipelines. Blocked from production releases and SSO identity settings.
          </p>
          
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Permissions Granted</span>
              <span className="text-purple-300 font-bold">{roleMappings.Developer.length} / {permissions.length} ({Math.round((roleMappings.Developer.length / (permissions.length || 1)) * 100)}%)</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-300 rounded-full transition-all duration-300" 
                style={{ width: `${(roleMappings.Developer.length / (permissions.length || 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
            <button
              onClick={() => resetRoleDefaults("Developer")}
              className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Developer
            </button>
            <span>Assigned Users: <strong>2</strong></span>
          </div>
        </div>
      </div>

      {/* TAB 1: VISUAL PERMISSION MATRIX TABLE */}
      {activeTab === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          {/* Header Controls */}
          <div className="space-y-4 border-b border-slate-800 pb-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  Visual Granular Permission Matrix
                </h2>
                <p className="text-xs text-slate-400">
                  Toggle permissions per role for resources like <span className="text-amber-300 font-semibold">Deploy</span>, <span className="text-purple-300 font-semibold">Modify Rules</span>, <span className="text-cyan-300 font-semibold">Access Logs</span>, and <span className="text-blue-300 font-semibold">Project Config</span>.
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Permission</span>
                </button>

                <button
                  onClick={applyPresetSOC2}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Preset: SOC2 Compliance</span>
                </button>

                <button
                  onClick={applyPresetDeveloperSandbox}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                  <span>Preset: Dev Sandbox</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
              {/* Resource Type Filters */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-500 font-mono text-[11px] px-2 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Resource:
                </span>
                {['all', 'Deploy', 'Modify Rules', 'Access Logs', 'Project Config', 'Security & Patching'].map(res => (
                  <button
                    key={res}
                    onClick={() => setSelectedResourceType(res)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedResourceType === res
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {res === 'all' ? 'All Resources' : res}
                  </button>
                ))}
              </div>

              {/* Matrix Search Input */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={matrixSearchQuery}
                  onChange={(e) => setMatrixSearchQuery(e.target.value)}
                  placeholder="Filter permissions by code/name..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-mono uppercase tracking-wider">
                  <th className="py-4 px-4 font-semibold w-5/12">Resource & Permission Definition</th>
                  
                  {/* Admin Header & Quick Controls */}
                  <th className="py-4 px-3 font-semibold text-center w-2/12 text-amber-300 bg-amber-950/20 border-x border-slate-800/80">
                    <div className="flex flex-col items-center space-y-1.5">
                      <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span className="font-bold">Admin</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px]">
                        <button
                          onClick={() => bulkGrantAll("Admin")}
                          className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded hover:bg-amber-500/40 cursor-pointer"
                        >
                          Grant All
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                          onClick={() => bulkRevokeAll("Admin")}
                          className="px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded hover:text-slate-200 cursor-pointer"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  </th>

                  {/* Auditor Header & Quick Controls */}
                  <th className="py-4 px-3 font-semibold text-center w-2/12 text-cyan-300 bg-cyan-950/20 border-r border-slate-800/80">
                    <div className="flex flex-col items-center space-y-1.5">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold">Auditor</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px]">
                        <button
                          onClick={() => bulkGrantAll("Auditor")}
                          className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded hover:bg-cyan-500/40 cursor-pointer"
                        >
                          Grant All
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                          onClick={() => bulkRevokeAll("Auditor")}
                          className="px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded hover:text-slate-200 cursor-pointer"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  </th>

                  {/* Developer Header & Quick Controls */}
                  <th className="py-4 px-3 font-semibold text-center w-2/12 text-purple-300 bg-purple-950/20">
                    <div className="flex flex-col items-center space-y-1.5">
                      <div className="flex items-center space-x-1">
                        <GitBranch className="w-4 h-4 text-purple-400" />
                        <span className="font-bold">Developer</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px]">
                        <button
                          onClick={() => bulkGrantAll("Developer")}
                          className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/40 cursor-pointer"
                        >
                          Grant All
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                          onClick={() => bulkRevokeAll("Developer")}
                          className="px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded hover:text-slate-200 cursor-pointer"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-sans">
                {filteredPermissions.length > 0 ? (
                  filteredPermissions.map(perm => {
                    const isAdminHas = roleMappings.Admin.includes(perm.code);
                    const isAuditorHas = roleMappings.Auditor.includes(perm.code);
                    const isDevHas = roleMappings.Developer.includes(perm.code);

                    return (
                      <tr key={perm.id} className="hover:bg-slate-800/50 transition-colors">
                        {/* Resource Details */}
                        <td className="py-4 px-4 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-100 text-sm">{perm.name}</span>
                            <span className="px-2 py-0.5 bg-slate-950 text-indigo-300 border border-slate-800 font-mono text-[10px] rounded font-semibold">
                              {perm.code}
                            </span>
                            
                            {/* Resource Tag */}
                            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${getResourceBadgeStyle(perm.resourceType)}`}>
                              Resource: {perm.resourceType || 'General'}
                            </span>

                            {/* Risk Tag */}
                            <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded uppercase border ${getRiskBadgeStyle(perm.riskLevel)}`}>
                              {perm.riskLevel || 'Low'} Risk
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs leading-relaxed">{perm.description}</p>
                        </td>

                        {/* Admin Toggle */}
                        <td className="py-4 px-3 text-center bg-amber-950/10 border-x border-slate-800/80">
                          <button
                            onClick={() => togglePermission("Admin", perm.code)}
                            className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
                              isAdminHas
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-950/40'
                                : 'bg-slate-950 text-slate-500 border border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isAdminHas ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                            {isAdminHas ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3 h-3 text-slate-600" />}
                            <span>{isAdminHas ? 'ALLOWED' : 'DENIED'}</span>
                          </button>
                        </td>

                        {/* Auditor Toggle */}
                        <td className="py-4 px-3 text-center bg-cyan-950/10 border-r border-slate-800/80">
                          <button
                            onClick={() => togglePermission("Auditor", perm.code)}
                            className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
                              isAuditorHas
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/40'
                                : 'bg-slate-950 text-slate-500 border border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isAuditorHas ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                            {isAuditorHas ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Lock className="w-3 h-3 text-slate-600" />}
                            <span>{isAuditorHas ? 'ALLOWED' : 'DENIED'}</span>
                          </button>
                        </td>

                        {/* Developer Toggle */}
                        <td className="py-4 px-3 text-center bg-purple-950/10">
                          <button
                            onClick={() => togglePermission("Developer", perm.code)}
                            className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
                              isDevHas
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-md shadow-purple-950/40'
                                : 'bg-slate-950 text-slate-500 border border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isDevHas ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'}`} />
                            {isDevHas ? <Check className="w-3.5 h-3.5 text-purple-400" /> : <Lock className="w-3 h-3 text-slate-600" />}
                            <span>{isDevHas ? 'ALLOWED' : 'DENIED'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500 text-xs">
                      No matching permissions found for filter query "{matrixSearchQuery}". Try clearing filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TENANT USERS & ROLE ASSIGNMENTS */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Multi-Tenant User Directory & Role Assignment Roster
              </h2>
              <p className="text-xs text-slate-400">Manage user identities across enterprise tenants and assign roles (<span className="text-amber-300 font-semibold">Admin</span>, <span className="text-cyan-300 font-semibold">Auditor</span>, <span className="text-purple-300 font-semibold">Developer</span>).</p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user, tenant or email..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-mono uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">User Identity & Email</th>
                  <th className="py-3.5 px-4 font-semibold">Organization Tenant</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned Role</th>
                  <th className="py-3.5 px-4 font-semibold">Security MFA</th>
                  <th className="py-3.5 px-4 font-semibold">Last Active</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                {filteredUsers.map(user => {
                  return (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{user.tenantName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{user.tenantId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-xs font-bold font-mono rounded border inline-flex items-center gap-1 ${
                          user.role === 'Admin'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : user.role === 'Auditor'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {user.mfaEnabled ? (
                          <span className="text-emerald-400 font-semibold font-mono flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold font-mono flex items-center gap-1 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" /> Optional
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {user.lastActive}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={user.role}
                          onChange={(e) => handleUserRoleChange(user.id, e.target.value as TenantRole)}
                          className="bg-slate-950 border border-slate-700 text-indigo-200 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-mono"
                        >
                          <option value="Admin">Role: Admin</option>
                          <option value="Auditor">Role: Auditor</option>
                          <option value="Developer">Role: Developer</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE ACCESS GATE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-400" />
              Real-Time RBAC/ABAC Access Gate Evaluator
            </h2>
            <p className="text-xs text-slate-400">Simulate incoming REST/gRPC operation calls with an active tenant user identity to test live gate policy decisions.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Inputs */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                Simulation Request Parameters
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Tenant User Identity:</label>
                <select
                  value={simUserEmail}
                  onChange={(e) => setSimUserEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-indigo-200 text-xs rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-mono"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.email}>
                      {u.name} ({u.role}) — {u.email} [{u.tenantName}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Attempted Operation Permission Code:</label>
                <select
                  value={simAction}
                  onChange={(e) => setSimAction(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-amber-300 text-xs rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-mono"
                >
                  {permissions.map(p => (
                    <option key={p.id} value={p.code}>
                      [{p.resourceType || 'General'}] {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Deployment Environment Context:</label>
                <div className="flex items-center space-x-3">
                  {(['dev', 'staging', 'prod'] as const).map(env => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => setSimEnvironment(env)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                        simEnvironment === env
                          ? 'bg-indigo-600 text-white border border-indigo-400'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleRunSimulator}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Evaluate Gate Access Decision</span>
              </button>
            </div>

            {/* Results Output */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Access Gate Evaluation Output
                  </span>
                  {simResult && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Timestamp: {simResult.evaluatedAt}
                    </span>
                  )}
                </h3>

                {simResult ? (
                  <div className="mt-4 space-y-4">
                    <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                      simResult.allowed
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                    }`}>
                      {simResult.allowed ? (
                        <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <div className="font-extrabold text-sm font-mono tracking-wide">
                          {simResult.allowed ? 'HTTP 200 OK — ACCESS ALLOWED' : 'HTTP 403 FORBIDDEN — ACCESS DENIED'}
                        </div>
                        <p className="text-xs leading-relaxed">{simResult.reason}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs space-y-1 text-slate-300">
                      <div>User: <span className="text-indigo-300">{simResult.evaluatedUser.name}</span> ({simResult.evaluatedUser.email})</div>
                      <div>Tenant Context: <span className="text-cyan-300">{simResult.evaluatedUser.tenantName}</span></div>
                      <div>Assigned Role: <span className="text-amber-300">{simResult.evaluatedUser.role}</span></div>
                      <div>Required Permission Code: <span className="text-emerald-300">{simResult.requiredPerm}</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-500 text-xs text-center font-sans">
                    Select parameters and click "Evaluate Gate Access Decision" to trigger OPA Rego simulation.
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-3 border-t border-slate-800">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulations execute OPA Rego rules with active tenant isolation checks.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OPA REGO POLICY EXPORT */}
      {activeTab === 'rego' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                Generated OPA Rego Policy Specification
              </h2>
              <p className="text-xs text-slate-400">Export live policy code enforced by the authorization gateway.</p>
            </div>

            <button
              onClick={copyRegoCode}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied Rego Policy</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy .rego Code</span>
                </>
              )}
            </button>
          </div>

          <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
            <pre>{generateRegoPolicy()}</pre>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM PERMISSION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Define Granular Permission
              </h3>
              <p className="text-xs text-slate-400">Add a new resource permission code to the enterprise access control matrix.</p>
            </div>

            <form onSubmit={handleCreateCustomPermission} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Permission Code (e.g., deploy:canary_release):</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. config:secret_rotate or deploy:canary_release"
                  value={newPermCode}
                  onChange={(e) => setNewPermCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Permission Display Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Execute Canary Production Release"
                  value={newPermName}
                  onChange={(e) => setNewPermName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Resource Type:</label>
                  <select
                    value={newPermResource}
                    onChange={(e) => setNewPermResource(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono cursor-pointer"
                  >
                    <option value="Deploy">Deploy</option>
                    <option value="Modify Rules">Modify Rules</option>
                    <option value="Access Logs">Access Logs</option>
                    <option value="Project Config">Project Config</option>
                    <option value="Security & Patching">Security & Patching</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Security Risk Level:</label>
                  <select
                    value={newPermRisk}
                    onChange={(e) => setNewPermRisk(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono cursor-pointer"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                    <option value="Critical">Critical Risk</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Description:</label>
                <textarea
                  rows={2}
                  placeholder="Explain what access this permission code grants..."
                  value={newPermDesc}
                  onChange={(e) => setNewPermDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 cursor-pointer shadow-lg shadow-indigo-900/40"
                >
                  Create & Grant to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
