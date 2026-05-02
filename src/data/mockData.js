/**
 * Central mock data repository for all query results and system simulations
 * @module mockData
 */

import { PERSONAS, SYSTEM_SOURCES } from '../utils/constants.js';

/**
 * Predefined users with hashed passwords (SHA-256 of simple passwords) and persona assignments
 * @type {Array<Object>}
 */
export const MOCK_USERS = [
  {
    id: 'user-lukas-001',
    username: 'lukas',
    email: 'lukas@dreeso.com',
    // SHA-256 of 'Password1'
    passwordHash: '4ac91ac7c5ef22c1a7b7d7b1a315bce82e7f0e2b0a0e1f3c5d6a7b8c9d0e1f2a',
    persona: PERSONAS.LUKAS.id,
    name: PERSONAS.LUKAS.name,
    role: PERSONAS.LUKAS.role,
    cluster: PERSONAS.LUKAS.cluster,
    avatar: PERSONAS.LUKAS.avatar,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'user-elena-002',
    username: 'elena',
    email: 'elena@dreeso.com',
    passwordHash: '5bd92bd8d6fg33d2b8c8e8c2b426cdf93f8g1f3c1b1f2g4d6e7b8c9d0e1f2a3b',
    persona: PERSONAS.ELENA.id,
    name: PERSONAS.ELENA.name,
    role: PERSONAS.ELENA.role,
    cluster: PERSONAS.ELENA.cluster,
    avatar: PERSONAS.ELENA.avatar,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'user-sophie-003',
    username: 'sophie',
    email: 'sophie@dreeso.com',
    passwordHash: '6ce03ce9e7gh44e3c9d9f9d3c537deg04g9h2g4d2c2g3h5e7f8c9d0e1f2a3b4c',
    persona: PERSONAS.SOPHIE.id,
    name: PERSONAS.SOPHIE.name,
    role: PERSONAS.SOPHIE.role,
    cluster: PERSONAS.SOPHIE.cluster,
    avatar: PERSONAS.SOPHIE.avatar,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'user-james-004',
    username: 'james',
    email: 'james@dreeso.com',
    passwordHash: '7df14df0f8hi55f4d0e0g0e4d648efh15h0i3h5e3d3h4i6f8g9d0e1f2a3b4c5d',
    persona: PERSONAS.JAMES.id,
    name: PERSONAS.JAMES.name,
    role: PERSONAS.JAMES.role,
    cluster: PERSONAS.JAMES.cluster,
    avatar: PERSONAS.JAMES.avatar,
    createdAt: '2024-01-15T08:00:00Z',
  },
];

/**
 * Source system indicators with live status
 * @type {Object<string, Object>}
 */
export const SOURCE_INDICATORS = {
  [SYSTEM_SOURCES.SAP.id]: {
    system: SYSTEM_SOURCES.SAP.name,
    label: SYSTEM_SOURCES.SAP.label,
    color: SYSTEM_SOURCES.SAP.color,
    live: true,
    lastSync: '2024-06-01T09:55:00Z',
    latency: '120ms',
  },
  [SYSTEM_SOURCES.PROCORE.id]: {
    system: SYSTEM_SOURCES.PROCORE.name,
    label: SYSTEM_SOURCES.PROCORE.label,
    color: SYSTEM_SOURCES.PROCORE.color,
    live: true,
    lastSync: '2024-06-01T09:58:00Z',
    latency: '85ms',
  },
  [SYSTEM_SOURCES.SALESFORCE.id]: {
    system: SYSTEM_SOURCES.SALESFORCE.name,
    label: SYSTEM_SOURCES.SALESFORCE.label,
    color: SYSTEM_SOURCES.SALESFORCE.color,
    live: true,
    lastSync: '2024-06-01T09:57:00Z',
    latency: '200ms',
  },
  [SYSTEM_SOURCES.PRIMAVERA.id]: {
    system: SYSTEM_SOURCES.PRIMAVERA.name,
    label: SYSTEM_SOURCES.PRIMAVERA.label,
    color: SYSTEM_SOURCES.PRIMAVERA.color,
    live: true,
    lastSync: '2024-06-01T09:50:00Z',
    latency: '310ms',
  },
};

/**
 * Intelligence cluster definitions for all 6 domains
 * @type {Array<Object>}
 */
export const INTELLIGENCE_CLUSTERS = [
  {
    id: 'cluster-operations',
    name: 'Operations Intelligence',
    domain: 'operations',
    description: 'Project delivery, scheduling, resource allocation, and operational efficiency analytics.',
    icon: 'operations',
    color: '#3B82F6',
    kpis: [
      { label: 'Active Projects', value: 24, unit: '', trend: 'up', change: 4.2 },
      { label: 'On-Time Delivery', value: 87, unit: '%', trend: 'up', change: 2.1 },
      { label: 'Resource Utilization', value: 78, unit: '%', trend: 'down', change: -1.5 },
      { label: 'Avg Schedule Variance', value: -3.2, unit: 'days', trend: 'up', change: 1.8 },
    ],
    sources: [SYSTEM_SOURCES.PROCORE.id, SYSTEM_SOURCES.PRIMAVERA.id],
  },
  {
    id: 'cluster-finance',
    name: 'Financial Intelligence',
    domain: 'finance',
    description: 'Revenue tracking, cost management, budget forecasting, and financial risk analytics.',
    icon: 'finance',
    color: '#10B981',
    kpis: [
      { label: 'Total Revenue', value: 142.5, unit: 'M', trend: 'up', change: 8.3 },
      { label: 'Gross Margin', value: 18.7, unit: '%', trend: 'down', change: -0.9 },
      { label: 'Cash Flow', value: 23.1, unit: 'M', trend: 'up', change: 5.2 },
      { label: 'Budget Variance', value: -2.4, unit: '%', trend: 'up', change: 1.1 },
    ],
    sources: [SYSTEM_SOURCES.SAP.id],
  },
  {
    id: 'cluster-engineering',
    name: 'Engineering Intelligence',
    domain: 'engineering',
    description: 'Technical performance, quality metrics, safety compliance, and engineering analytics.',
    icon: 'engineering',
    color: '#8B5CF6',
    kpis: [
      { label: 'RFIs Open', value: 47, unit: '', trend: 'down', change: -12.0 },
      { label: 'Quality Score', value: 94.2, unit: '%', trend: 'up', change: 1.3 },
      { label: 'Safety Incidents', value: 2, unit: '', trend: 'down', change: -33.3 },
      { label: 'Defect Rate', value: 1.8, unit: '%', trend: 'down', change: -0.4 },
    ],
    sources: [SYSTEM_SOURCES.PROCORE.id, SYSTEM_SOURCES.SAP.id],
  },
  {
    id: 'cluster-sales',
    name: 'Sales Intelligence',
    domain: 'sales',
    description: 'Pipeline management, win rates, client engagement, and business development analytics.',
    icon: 'sales',
    color: '#F59E0B',
    kpis: [
      { label: 'Pipeline Value', value: 89.3, unit: 'M', trend: 'up', change: 12.7 },
      { label: 'Win Rate', value: 34, unit: '%', trend: 'up', change: 3.2 },
      { label: 'Avg Deal Size', value: 4.7, unit: 'M', trend: 'up', change: 0.8 },
      { label: 'Active Proposals', value: 18, unit: '', trend: 'up', change: 5.9 },
    ],
    sources: [SYSTEM_SOURCES.SALESFORCE.id],
  },
  {
    id: 'cluster-risk',
    name: 'Risk Intelligence',
    domain: 'risk',
    description: 'Cross-project risk identification, mitigation tracking, and risk exposure analytics.',
    icon: 'risk',
    color: '#EF4444',
    kpis: [
      { label: 'High Risks', value: 7, unit: '', trend: 'down', change: -2.0 },
      { label: 'Risk Exposure', value: 12.4, unit: 'M', trend: 'down', change: -8.1 },
      { label: 'Mitigated This Month', value: 14, unit: '', trend: 'up', change: 16.7 },
      { label: 'Avg Risk Score', value: 3.2, unit: '/5', trend: 'down', change: -0.3 },
    ],
    sources: [SYSTEM_SOURCES.SAP.id, SYSTEM_SOURCES.PROCORE.id, SYSTEM_SOURCES.PRIMAVERA.id],
  },
  {
    id: 'cluster-portfolio',
    name: 'Portfolio Intelligence',
    domain: 'portfolio',
    description: 'Cross-portfolio performance, strategic alignment, and executive-level analytics.',
    icon: 'portfolio',
    color: '#06B6D4',
    kpis: [
      { label: 'Portfolio Value', value: 312.8, unit: 'M', trend: 'up', change: 6.4 },
      { label: 'Projects At Risk', value: 5, unit: '', trend: 'down', change: -16.7 },
      { label: 'Strategic Alignment', value: 82, unit: '%', trend: 'up', change: 3.0 },
      { label: 'ROI', value: 14.2, unit: '%', trend: 'up', change: 1.1 },
    ],
    sources: [SYSTEM_SOURCES.SAP.id, SYSTEM_SOURCES.PROCORE.id, SYSTEM_SOURCES.SALESFORCE.id, SYSTEM_SOURCES.PRIMAVERA.id],
  },
];

/**
 * CTA bubble definitions mapped by query context
 * @type {Object<string, Array<Object>>}
 */
export const CTA_BUBBLES = {
  project_risks: [
    { id: 'cta-risk-mitigate', label: 'Show mitigation actions', query: 'What mitigation actions are available for these risks?', icon: 'shield' },
    { id: 'cta-risk-cost', label: 'Drill into cost drivers', query: 'Show me the cost drivers behind these risks', icon: 'dollar' },
    { id: 'cta-risk-timeline', label: 'View timeline impact', query: 'How do these risks affect the project timeline?', icon: 'clock' },
  ],
  budget_overview: [
    { id: 'cta-budget-variance', label: 'Analyze variances', query: 'Show me budget variance breakdown by category', icon: 'chart' },
    { id: 'cta-budget-forecast', label: 'View forecast', query: 'What is the budget forecast for next quarter?', icon: 'trending' },
    { id: 'cta-budget-approve', label: 'Approve adjustments', query: 'Show pending budget adjustments for approval', icon: 'check' },
  ],
  schedule_status: [
    { id: 'cta-schedule-critical', label: 'Critical path analysis', query: 'Show me the critical path for this project', icon: 'path' },
    { id: 'cta-schedule-resource', label: 'Resource conflicts', query: 'Are there any resource conflicts on the schedule?', icon: 'users' },
    { id: 'cta-schedule-delay', label: 'Delay root causes', query: 'What are the root causes of schedule delays?', icon: 'alert' },
  ],
  pipeline_analysis: [
    { id: 'cta-pipeline-top', label: 'Top opportunities', query: 'Show me the top 5 opportunities by value', icon: 'star' },
    { id: 'cta-pipeline-stale', label: 'Stale deals', query: 'Which deals have been stale for over 30 days?', icon: 'clock' },
    { id: 'cta-pipeline-forecast', label: 'Revenue forecast', query: 'What is the revenue forecast for this quarter?', icon: 'trending' },
  ],
  quality_metrics: [
    { id: 'cta-quality-rfi', label: 'Open RFIs', query: 'Show me all open RFIs by priority', icon: 'document' },
    { id: 'cta-quality-defects', label: 'Defect trends', query: 'What are the defect trends over the last 6 months?', icon: 'chart' },
    { id: 'cta-quality-safety', label: 'Safety report', query: 'Generate the latest safety compliance report', icon: 'shield' },
  ],
  portfolio_overview: [
    { id: 'cta-portfolio-risk', label: 'At-risk projects', query: 'Which projects in the portfolio are at risk?', icon: 'alert' },
    { id: 'cta-portfolio-roi', label: 'ROI breakdown', query: 'Show me ROI breakdown by project category', icon: 'chart' },
    { id: 'cta-portfolio-strategic', label: 'Strategic alignment', query: 'How well are projects aligned with strategic goals?', icon: 'target' },
  ],
};

/**
 * Action templates for simulated execution
 * @type {Array<Object>}
 */
export const ACTION_TEMPLATES = [
  {
    id: 'action-approve-budget',
    name: 'Approve Budget',
    description: 'Approve the proposed budget adjustment for the selected project.',
    system: SYSTEM_SOURCES.SAP.id,
    systemLabel: SYSTEM_SOURCES.SAP.label,
    requiredRole: ['operations', 'finance'],
    confirmationMessage: 'Are you sure you want to approve this budget adjustment?',
    successMessage: 'Budget adjustment approved successfully.',
    fields: [
      { name: 'projectId', label: 'Project ID', type: 'text', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea', required: false },
    ],
  },
  {
    id: 'action-create-change-order',
    name: 'Create Change Order',
    description: 'Create a new change order in Procore for the selected project.',
    system: SYSTEM_SOURCES.PROCORE.id,
    systemLabel: SYSTEM_SOURCES.PROCORE.label,
    requiredRole: ['operations', 'engineering'],
    confirmationMessage: 'Are you sure you want to create this change order?',
    successMessage: 'Change order created successfully.',
    fields: [
      { name: 'projectId', label: 'Project ID', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'estimatedCost', label: 'Estimated Cost', type: 'number', required: true },
    ],
  },
  {
    id: 'action-update-forecast',
    name: 'Update Forecast',
    description: 'Update the revenue forecast in SAP for the current quarter.',
    system: SYSTEM_SOURCES.SAP.id,
    systemLabel: SYSTEM_SOURCES.SAP.label,
    requiredRole: ['finance'],
    confirmationMessage: 'Are you sure you want to update the forecast?',
    successMessage: 'Forecast updated successfully.',
    fields: [
      { name: 'quarter', label: 'Quarter', type: 'text', required: true },
      { name: 'amount', label: 'Forecast Amount', type: 'number', required: true },
    ],
  },
  {
    id: 'action-schedule-meeting',
    name: 'Schedule Risk Review',
    description: 'Schedule a risk review meeting with stakeholders.',
    system: SYSTEM_SOURCES.PRIMAVERA.id,
    systemLabel: SYSTEM_SOURCES.PRIMAVERA.label,
    requiredRole: ['operations', 'engineering', 'finance'],
    confirmationMessage: 'Schedule this risk review meeting?',
    successMessage: 'Risk review meeting scheduled successfully.',
    fields: [
      { name: 'projectId', label: 'Project ID', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'text', required: true },
      { name: 'attendees', label: 'Attendees', type: 'text', required: true },
    ],
  },
  {
    id: 'action-update-opportunity',
    name: 'Update Opportunity',
    description: 'Update opportunity status and details in Salesforce.',
    system: SYSTEM_SOURCES.SALESFORCE.id,
    systemLabel: SYSTEM_SOURCES.SALESFORCE.label,
    requiredRole: ['sales'],
    confirmationMessage: 'Are you sure you want to update this opportunity?',
    successMessage: 'Opportunity updated successfully.',
    fields: [
      { name: 'opportunityId', label: 'Opportunity ID', type: 'text', required: true },
      { name: 'stage', label: 'Stage', type: 'text', required: true },
      { name: 'value', label: 'Value', type: 'number', required: false },
      { name: 'notes', label: 'Notes', type: 'textarea', required: false },
    ],
  },
  {
    id: 'action-resolve-rfi',
    name: 'Resolve RFI',
    description: 'Mark an RFI as resolved in Procore.',
    system: SYSTEM_SOURCES.PROCORE.id,
    systemLabel: SYSTEM_SOURCES.PROCORE.label,
    requiredRole: ['engineering'],
    confirmationMessage: 'Mark this RFI as resolved?',
    successMessage: 'RFI resolved successfully.',
    fields: [
      { name: 'rfiId', label: 'RFI ID', type: 'text', required: true },
      { name: 'resolution', label: 'Resolution Notes', type: 'textarea', required: true },
    ],
  },
  {
    id: 'action-export-report',
    name: 'Export Report',
    description: 'Export the current analytics report as a PDF.',
    system: SYSTEM_SOURCES.SAP.id,
    systemLabel: SYSTEM_SOURCES.SAP.label,
    requiredRole: ['operations', 'finance', 'engineering', 'sales'],
    confirmationMessage: 'Export this report?',
    successMessage: 'Report exported successfully.',
    fields: [
      { name: 'reportName', label: 'Report Name', type: 'text', required: true },
      { name: 'format', label: 'Format', type: 'text', required: false },
    ],
  },
];

/**
 * Query-response mappings for Lukas (Project Manager - Operations)
 * @type {Array<Object>}
 */
export const LUKAS_QUERY_RESPONSES = [
  {
    id: 'lukas-q1',
    keywords: ['project', 'risk', 'risks'],
    query: 'Show me project risks for Lukas',
    resultType: 'table',
    title: 'Project Risk Assessment',
    summary: 'Analysis of current project risks across your active portfolio. 3 high-priority risks identified requiring immediate attention.',
    data: [
      { id: 'r1', risk: 'Foundation Delay - Tower B', probability: 0.7, impact: 'High', status: 'Open', project: 'Marina Bay Tower', owner: 'Structural Team', dueDate: '2024-06-15' },
      { id: 'r2', risk: 'Material Cost Overrun', probability: 0.5, impact: 'Medium', status: 'Monitoring', project: 'Highway Extension A12', owner: 'Procurement', dueDate: '2024-06-30' },
      { id: 'r3', risk: 'Permit Approval Delay', probability: 0.8, impact: 'High', status: 'Open', project: 'Central Park Renovation', owner: 'Legal Team', dueDate: '2024-06-10' },
      { id: 'r4', risk: 'Subcontractor Availability', probability: 0.4, impact: 'Medium', status: 'Mitigated', project: 'Marina Bay Tower', owner: 'PM Office', dueDate: '2024-07-01' },
      { id: 'r5', risk: 'Weather Disruption', probability: 0.6, impact: 'Low', status: 'Monitoring', project: 'Highway Extension A12', owner: 'Site Manager', dueDate: '2024-06-20' },
    ],
    sources: [SYSTEM_SOURCES.PROCORE.id, SYSTEM_SOURCES.PRIMAVERA.id],
    ctaContext: 'project_risks',
    actions: ['action-schedule-meeting', 'action-export-report'],
    cluster: 'operations',
  },
  {
    id: 'lukas-q2',
    keywords: ['schedule', 'timeline', 'status', 'progress'],
    query: 'What is the schedule status across my projects?',
    resultType: 'table',
    title: 'Schedule Status Overview',
    summary: 'Current schedule performance across all active projects. 2 projects are behind schedule, 1 is ahead.',
    data: [
      { id: 's1', project: 'Marina Bay Tower', phase: 'Foundation', planned: '2024-05-01', actual: '2024-05-15', variance: '+14 days', status: 'Behind' },
      { id: 's2', project: 'Highway Extension A12', phase: 'Grading', planned: '2024-04-15', actual: '2024-04-10', variance: '-5 days', status: 'Ahead' },
      { id: 's3', project: 'Central Park Renovation', phase: 'Design Review', planned: '2024-05-20', actual: '2024-06-01', variance: '+12 days', status: 'Behind' },
      { id: 's4', project: 'Office Complex Delta', phase: 'Steel Erection', planned: '2024-05-30', actual: '2024-05-30', variance: '0 days', status: 'On Track' },
    ],
    sources: [SYSTEM_SOURCES.PRIMAVERA.id, SYSTEM_SOURCES.PROCORE.id],
    ctaContext: 'schedule_status',
    actions: ['action-schedule-meeting', 'action-export-report'],
    cluster: 'operations',
  },
  {
    id: 'lukas-q3',
    keywords: ['portfolio', 'overview', 'summary', 'all projects'],
    query: 'Give me a portfolio overview',
    resultType: 'kpi',
    title: 'Portfolio Performance Dashboard',
    summary: 'Executive summary of your project portfolio. Overall health is good with 2 projects requiring attention.',
    data: [
      { label: 'Total Projects', value: 8, unit: '', trend: 'stable', change: 0 },
      { label: 'On Track', value: 5, unit: '', trend: 'up', change: 1 },
      { label: 'At Risk', value: 2, unit: '', trend: 'down', change: -1 },
      { label: 'Total Value', value: 187.4, unit: 'M', trend: 'up', change: 3.2 },
      { label: 'Avg Completion', value: 62, unit: '%', trend: 'up', change: 5.0 },
      { label: 'Budget Utilization', value: 71, unit: '%', trend: 'stable', change: 0.3 },
    ],
    sources: [SYSTEM_SOURCES.SAP.id, SYSTEM_SOURCES.PROCORE.id, SYSTEM_SOURCES.PRIMAVERA.id],
    ctaContext: 'portfolio_overview',
    actions: ['action-export-report'],
    cluster: 'portfolio',
  },
  {
    id: 'lukas-q4',
    keywords: ['budget', 'cost', 'spend', 'financial'],
    query: 'Show me budget status for my projects',
    resultType: 'table',
    title: 'Project Budget Status',
    summary: 'Budget performance across active projects. Highway Extension A12 shows a 7.2% overrun requiring review.',
    data: [
      { id: 'b1', project: 'Marina Bay Tower', budget: 45.2, spent: 28.7, remaining: 16.5, variance: -1.2, variancePercent: -2.7, status: 'On Track' },
      { id: 'b2', project: 'Highway Extension A12', budget: 32.8, spent: 25.1, remaining: 7.7, variance: -2.4, variancePercent: -7.2, status: 'Over Budget' },
      { id: 'b3', project: 'Central Park Renovation', budget: 18.5, spent: 9.2, remaining: 9.3, variance: 0.8, variancePercent: 4.3, status: 'Under Budget' },
      { id: 'b4', project: 'Office Complex Delta', budget: 67.0, spent: 41.3, remaining: 25.7, variance: -0.5, variancePercent: -0.7, status: 'On Track' },
    ],
    sources: [SYSTEM_SOURCES.SAP.id],
    ctaContext: 'budget_overview',
    actions: ['action-approve-budget', 'action-export-report'],
    cluster: 'finance',
  },
];

/**
 * Query-response mappings for Elena (Finance Director)
 * @type {Array<Object>}
 */
export const ELENA_QUERY_RESPONSES = [
  {
    id: 'elena-q1',
    keywords: ['revenue', 'income', 'earnings'],
    query: 'Show me revenue analysis',
    resultType: 'kpi',
    title: 'Revenue Analysis - Q2 2024',
    summary: 'Revenue performance is tracking 8.3% above target. Commercial projects are the primary growth driver.',
    data: [
      { label: 'Total Revenue', value: 142.5, unit: 'M', trend: 'up', change: 8.3 },
      { label: 'Commercial', value: 89.2, unit: 'M', trend: 'up', change: 12.1 },
      { label: 'Residential', value: 38.7, unit: 'M', trend: 'up', change: 3.4 },
      { label: 'Infrastructure', value: 14.6, unit: 'M', trend: 'down', change: -2.1 },
      { label: 'Gross Margin', value: 18.7, unit: '%', trend: 'down', change: -0.9 },
      { label: 'Net Margin', value: 11.2, unit: '%', trend: 'up', change: 0.4 },
    ],
    sources: [SYSTEM_SOURCES.SAP.id],
    ctaContext: 'budget_overview',
    actions: ['action-update-forecast', 'action-export-report'],
    cluster: 'finance',
  },
  {
    id: 'elena-q2',
    keywords: ['budget', 'variance', 'cost', 'overrun'],
    query: 'What are the budget variances across projects?',
    resultType: 'table',
    title: 'Budget Variance Report',
    summary: 'Cross-project budget analysis shows 3 projects within tolerance and 2 requiring corrective action.',
    data: [
      { id: 'bv1', project: 'Marina Bay Tower', originalBudget: 45.2, revisedBudget: 46.4, actualCost: 28.7, variance: -1.2, status: 'Within Tolerance' },
      { id: 'bv2', project: 'Highway Extension A12', originalBudget: 30.4, revisedBudget: 32.8, actualCost: 25.1, variance: -2.4, status: 'Over Budget' },
      { id: 'bv3', project: 'Central Park Renovation', originalBudget: 18.5, revisedBudget: 18.5, actualCost: 9.2, variance: 0.8, status: 'Under Budget' },
      { id: 'bv4', project: 'Office Complex Delta', originalBudget: 67.0, revisedBudget: 67.5, actualCost: 41.3, variance: -0.5, status: 'Within Tolerance' },
      { id: 'bv5', project: 'Riverside Apartments', originalBudget: 22.0, revisedBudget: 24.1, actualCost: 18.9, variance: -3.2, status: 'Over Budget' },
    ],
    sources: [SYSTEM_SOURCES.SAP.id, SYSTEM_SOURCES.PROCORE.id],
    ctaContext: 'budget_overview',
    actions: ['action-approve-budget', 'action-update-forecast', 'action-export-report'],
    cluster: 'finance',
  },
  {
    id: 'elena-q3',
    keywords: ['cash', 'flow', 'liquidity'],
    query: 'Show me cash flow analysis',
    resultType: 'forecast',
    title: 'Cash Flow Forecast',
    summary: 'Cash position is healthy with projected positive flow through Q3. Collections are on track.',
    data: [
      { month: 'Jan 2024', inflow: 18.2, outflow: 15.8, net: 2.4, cumulative: 2.4 },
      { month: 'Feb 2024', inflow: 21.5, outflow: 19.2, net: 2.3, cumulative: 4.7 },
      { month: 'Mar 2024', inflow: 24.8, outflow: 20.1, net: 4.7, cumulative: 9.4 },
      { month: 'Apr 2024', inflow: 22.1, outflow: 21.5, net: 0.6, cumulative: 10.0 },
      { month: 'May 2024', inflow: 26.3, outflow: 22.8, net: 3.5, cumulative: 13.5 },
      { month: 'Jun 2024', inflow: 28.7, outflow: 24.1, net: 4.6, cumulative: 18.1 },
      { month: 'Jul 2024 (F)', inflow: 25.0, outflow: 23.0, net: 2.0, cumulative: 20.1 },
      { month: 'Aug 2024 (F)', inflow: 27.5, outflow: 24.5, net: 3.0, cumulative: 23.1 },
    ],
    sources: [SYSTEM_SOURCES.SAP.id],
    ctaContext: 'budget_overview',
    actions: ['action-update-forecast', 'action-export-report'],
    cluster: 'finance',
  },
  {
    id: 'elena-q4',
    keywords: ['quantity', 'surveying', 'qs', 'measurement', 'valuation'],
    query: 'Show me QS analytics',
    resultType: 'table',
    title: 'Quantity Surveying Analytics',
    summary: 'QS performance summary across active projects. Valuation accuracy is at 96.8%.',
    data: [
      { id: 'qs1', project: 'Marina Bay Tower', contractValue: 45.2, certifiedValue: 28.7, retentionHeld: 1.4, claimsSubmitted: 2.1, claimsApproved: 1.8 },
      { id: 'qs2', project: 'Highway Extension A12', contractValue: 32.8, certifiedValue: 25.1, retentionHeld: 1.3, claimsSubmitted: 3.4, claimsApproved: 2.9 },
      { id: 'qs3', project: 'Office Complex Delta', contractValue: 67.0, certifiedValue: 41.3, retentionHeld: 2.1, claimsSubmitted: 1.5, claimsApproved: 1.5 },
    ],
    sources: [SYSTEM_SOURCES.SAP.id, SYSTEM_SOURCES.PROCORE.id],
    ctaContext: 'budget_overview',
    actions: ['action-approve-budget', 'action-export-report'],
    cluster: 'finance',
  },
];

/**
 * Query-response mappings for Sophie (Site Engineer - Engineering)
 * @type {Array<Object>}
 */
export const SOPHIE_QUERY_RESPONSES = [
  {
    id: 'sophie-q1',
    keywords: ['rfi', 'request', 'information'],
    query: 'Show me open RFIs',
    resultType: 'table',
    title: 'Open RFI Status',
    summary: '47 RFIs currently open across all projects. 12 are overdue and require immediate response.',
    data: [
      { id: 'rfi1', number: 'RFI-2024-0142', project: 'Marina Bay Tower', subject: 'Foundation reinforcement detail', priority: 'High', daysOpen: 14, assignedTo: 'Structural Lead', status: 'Overdue' },
      { id: 'rfi2', number: 'RFI-2024-0156', project: 'Marina Bay Tower', subject: 'MEP coordination Level 3', priority: 'Medium', daysOpen: 7, assignedTo: 'MEP Coordinator', status: 'In Review' },
      { id: 'rfi3', number: 'RFI-2024-0161', project: 'Highway Extension A12', subject: 'Drainage design clarification', priority: 'High', daysOpen: 21, assignedTo: 'Civil Lead', status: 'Overdue' },
      { id: 'rfi4', number: 'RFI-2024-0168', project: 'Office Complex Delta', subject: 'Curtain wall specification', priority: 'Low', daysOpen: 3, assignedTo: 'Facade Engineer', status: 'Open' },
      { id: 'rfi5', number: 'RFI-2024-0172', project: 'Central Park Renovation', subject: 'Landscape grading approval', priority: 'Medium', daysOpen: 5, assignedTo: 'Landscape Architect', status: 'In Review' },
    ],
    sources: [SYSTEM_SOURCES.PROCORE.id],
    ctaContext: 'quality_metrics',
    actions: ['action-resolve-rfi', 'action-export-report'],
    cluster: 'engineering',
  },
  {
    id: 'sophie-q2',
    keywords: ['quality', 'defect', 'inspection', 'punch'],
    query: 'Show me quality metrics',
    resultType: 'kpi',
    title: 'Quality Performance Dashboard',
    summary: 'Overall quality score is 94.2%. Defect rate has decreased by 0.4% this month.',
    data: [
      { label: 'Quality Score', value: 94.2, unit: '%', trend: 'up', change: 1.3 },
      { label: 'Defect Rate', value: 1.8, unit: '%', trend: 'down', change: -0.4 },
      { label: 'Inspections Passed', value: 156, unit: '', trend: 'up', change: 8.3 },
      { label: 'Inspections Failed', value: 12, unit: '', trend: 'down', change: -14.3 },
      { label: 'Punch List Items', value: 89, unit: '', trend: 'down', change: -6.3 },
      { label: 'Avg Resolution Time', value: 4.2, unit: 'days', trend: 'down', change: -12.5 },
    ],
    sources: [SYSTEM_SOURCES.PROCORE.id],
    ctaContext: 'quality_metrics',
    actions: ['action-resolve-rfi', 'action-export-report'],
    cluster: 'engineering',
  },
  {
    id: 'sophie-q3',
    keywords: ['safety', 'incident', 'compliance', 'hse'],
    query: 'Show me safety compliance report',
    resultType: 'table',
    title: 'Safety Compliance Report',
    summary: 'Safety performance is strong with only 2 recordable incidents this quarter. All sites are compliant.',
    data: [
      { id: 'sf1', project: 'Marina Bay Tower', safetyScore: 97, incidents: 0, nearMisses: 2, toolboxTalks: 24, lastAudit: '2024-05-28', status: 'Compliant' },
      { id: 'sf2', project: 'Highway Extension A12', safetyScore: 92, incidents: 1, nearMisses: 4, toolboxTalks: 20, lastAudit: '2024-05-25', status: 'Compliant' },
      { id: 'sf3', project: 'Central Park Renovation', safetyScore: 95, incidents: 0, nearMisses: 1, toolboxTalks: 18, lastAudit: '2024-05-30', status: 'Compliant' },
      { id: 'sf4', project: 'Office Complex Delta', safetyScore: 89, incidents: 1, nearMisses: 5, toolboxTalks: 22, lastAudit: '2024-05-20', status: 'Under Review' },
    ],
    sources: [SYSTEM_SOURCES.PROCORE.id, SYSTEM_SOURCES.SAP.id],
    ctaContext: 'quality_metrics',
    actions: ['action-schedule-meeting', 'action-export-report'],
    cluster: 'engineering',
  },
  {
    id: 'sophie-q4',
    keywords: ['resource', 'team', 'workforce', 'labor', 'manpower'],
    query: 'Show me resource allocation',
    resultType: 'table',
    title: 'Resource Allocation Overview',
    summary: 'Current workforce allocation across projects. Marina Bay Tower is slightly over-resourced.',
    data: [
      { id: 'res1', project: 'Marina Bay Tower', planned: 120, actual: 135, variance: '+15', utilization: 89, status: 'Over-Allocated' },
      { id: 'res2', project: 'Highway Extension A12', planned: 85, actual: 80, variance: '-5', utilization: 94, status: 'Optimal' },
      { id: 'res3', project: 'Central Park Renovation', planned: 45, actual: 42, variance: '-3', utilization: 78, status: 'Under-Utilized' },
      { id: 'res4', project: 'Office Complex Delta', planned: 95, actual: 92, variance: '-3', utilization: 91, status: 'Optimal' },
    ],
    sources: [SYSTEM_SOURCES.PRIMAVERA.id, SYSTEM_SOURCES.PROCORE.id],
    ctaContext: 'schedule_status',
    actions: ['action-schedule-meeting', 'action-export-report'],
    cluster: 'operations',
  },
];

/**
 * Query-response mappings for James (Sales Executive - Sales/BD)
 * @type {Array<Object>}
 */
export const JAMES_QUERY_RESPONSES = [
  {
    id: 'james-q1',
    keywords: ['pipeline', 'opportunity', 'opportunities', 'deals'],
    query: 'Show me the sales pipeline',
    resultType: 'table',
    title: 'Sales Pipeline Overview',
    summary: 'Current pipeline value is $89.3M across 18 active opportunities. Win rate trending up at 34%.',
    data: [
      { id: 'opp1', name: 'Metro Transit Hub', client: 'City of Metro', value: 24.5, stage: 'Proposal', probability: 60, daysInStage: 14, nextAction: 'Client presentation', owner: 'James' },
      { id: 'opp2', name: 'Lakeside Commercial Center', client: 'Lakeside Dev Corp', value: 18.2, stage: 'Negotiation', probability: 75, daysInStage: 8, nextAction: 'Final pricing review', owner: 'James' },
      { id: 'opp3', name: 'University Science Building', client: 'State University', value: 12.8, stage: 'Qualification', probability: 40, daysInStage: 21, nextAction: 'Site visit', owner: 'Sarah' },
      { id: 'opp4', name: 'Airport Terminal Expansion', client: 'National Aviation', value: 45.0, stage: 'Proposal', probability: 35, daysInStage: 30, nextAction: 'Technical submission', owner: 'James' },
      { id: 'opp5', name: 'Residential Tower Greenfield', client: 'Greenfield Properties', value: 8.7, stage: 'Closed Won', probability: 100, daysInStage: 0, nextAction: 'Contract signing', owner: 'Mark' },
    ],
    sources: [SYSTEM_SOURCES.SALESFORCE.id],
    ctaContext: 'pipeline_analysis',
    actions: ['action-update-opportunity', 'action-export-report'],
    cluster: 'sales',
  },
  {
    id: 'james-q2',
    keywords: ['win', 'rate', 'conversion', 'close'],
    query: 'What is our win rate this quarter?',
    resultType: 'kpi',
    title: 'Win Rate Analysis - Q2 2024',
    summary: 'Win rate has improved to 34% this quarter, up from 31% in Q1. Average deal cycle is 67 days.',
    data: [
      { label: 'Win Rate', value: 34, unit: '%', trend: 'up', change: 3.2 },
      { label: 'Deals Won', value: 6, unit: '', trend: 'up', change: 20.0 },
      { label: 'Deals Lost', value: 4, unit: '', trend: 'down', change: -20.0 },
      { label: 'Avg Deal Cycle', value: 67, unit: 'days', trend: 'down', change: -8.2 },
      { label: 'Avg Deal Size', value: 4.7, unit: 'M', trend: 'up', change: 0.8 },
      { label: 'Pipeline Velocity', value: 12.3, unit: 'M/mo', trend: 'up', change: 15.0 },
    ],
    sources: [SYSTEM_SOURCES.SALESFORCE.id],
    ctaContext: 'pipeline_analysis',
    actions: ['action-update-opportunity', 'action-export-report'],
    cluster: 'sales',
  },
  {
    id: 'james-q3',
    keywords: ['forecast', 'revenue', 'projection', 'target'],
    query: 'Show me the revenue forecast',
    resultType: 'forecast',
    title: 'Revenue Forecast - H2 2024',
    summary: 'Projected revenue for H2 2024 is $78.5M, representing a 12% increase over H1. Pipeline conversion is the key driver.',
    data: [
      { month: 'Jul 2024', committed: 12.5, bestCase: 15.2, worstCase: 10.8, target: 13.0 },
      { month: 'Aug 2024', committed: 11.8, bestCase: 14.5, worstCase: 9.5, target: 13.0 },
      { month: 'Sep 2024', committed: 13.2, bestCase: 16.8, worstCase: 11.0, target: 13.5 },
      { month: 'Oct 2024', committed: 10.5, bestCase: 14.0, worstCase: 8.2, target: 13.5 },
      { month: 'Nov 2024', committed: 14.0, bestCase: 17.5, worstCase: 11.5, target: 14.0 },
      { month: 'Dec 2024', committed: 16.5, bestCase: 20.0, worstCase: 13.0, target: 14.0 },
    ],
    sources: [SYSTEM_SOURCES.SALESFORCE.id, SYSTEM_SOURCES.SAP.id],
    ctaContext: 'pipeline_analysis',
    actions: ['action-update-forecast', 'action-export-report'],
    cluster: 'sales',
  },
  {
    id: 'james-q4',
    keywords: ['client', 'relationship', 'account', 'engagement'],
    query: 'Show me client engagement metrics',
    resultType: 'table',
    title: 'Client Engagement Dashboard',
    summary: 'Top client engagement metrics. City of Metro and Lakeside Dev Corp are the most active accounts.',
    data: [
      { id: 'cl1', client: 'City of Metro', totalValue: 42.5, activeProjects: 3, satisfaction: 4.5, lastContact: '2024-05-30', engagementScore: 92 },
      { id: 'cl2', client: 'Lakeside Dev Corp', totalValue: 28.7, activeProjects: 2, satisfaction: 4.2, lastContact: '2024-05-28', engagementScore: 87 },
      { id: 'cl3', client: 'State University', totalValue: 12.8, activeProjects: 1, satisfaction: 4.0, lastContact: '2024-05-15', engagementScore: 71 },
      { id: 'cl4', client: 'National Aviation', totalValue: 45.0, activeProjects: 1, satisfaction: 3.8, lastContact: '2024-05-20', engagementScore: 65 },
      { id: 'cl5', client: 'Greenfield Properties', totalValue: 8.7, activeProjects: 1, satisfaction: 4.7, lastContact: '2024-06-01', engagementScore: 95 },
    ],
    sources: [SYSTEM_SOURCES.SALESFORCE.id],
    ctaContext: 'pipeline_analysis',
    actions: ['action-update-opportunity', 'action-export-report'],
    cluster: 'sales',
  },
];

/**
 * All query responses indexed by persona
 * @type {Object<string, Array<Object>>}
 */
export const QUERY_RESPONSES_BY_PERSONA = {
  [PERSONAS.LUKAS.id]: LUKAS_QUERY_RESPONSES,
  [PERSONAS.ELENA.id]: ELENA_QUERY_RESPONSES,
  [PERSONAS.SOPHIE.id]: SOPHIE_QUERY_RESPONSES,
  [PERSONAS.JAMES.id]: JAMES_QUERY_RESPONSES,
};

/**
 * Default/fallback query response when no match is found
 * @type {Object}
 */
export const DEFAULT_QUERY_RESPONSE = {
  id: 'default-response',
  resultType: 'kpi',
  title: 'General Analytics Overview',
  summary: 'Here is a general overview of key metrics across your domain. Try asking a more specific question for detailed insights.',
  data: [
    { label: 'Active Projects', value: 24, unit: '', trend: 'up', change: 4.2 },
    { label: 'Total Portfolio Value', value: 312.8, unit: 'M', trend: 'up', change: 6.4 },
    { label: 'On-Time Delivery', value: 87, unit: '%', trend: 'up', change: 2.1 },
    { label: 'Budget Utilization', value: 78, unit: '%', trend: 'stable', change: 0.3 },
  ],
  sources: [SYSTEM_SOURCES.SAP.id, SYSTEM_SOURCES.PROCORE.id],
  ctaContext: 'portfolio_overview',
  actions: ['action-export-report'],
  cluster: 'portfolio',
};

/**
 * Dashboard quick stats per persona
 * @type {Object<string, Array<Object>>}
 */
export const DASHBOARD_STATS = {
  [PERSONAS.LUKAS.id]: [
    { label: 'Active Projects', value: 8, unit: '', icon: 'folder', color: '#3B82F6' },
    { label: 'At Risk', value: 2, unit: '', icon: 'alert', color: '#EF4444' },
    { label: 'On Track', value: 5, unit: '', icon: 'check', color: '#10B981' },
    { label: 'Budget Health', value: 92, unit: '%', icon: 'dollar', color: '#F59E0B' },
  ],
  [PERSONAS.ELENA.id]: [
    { label: 'Revenue YTD', value: 142.5, unit: 'M', icon: 'trending', color: '#10B981' },
    { label: 'Gross Margin', value: 18.7, unit: '%', icon: 'chart', color: '#3B82F6' },
    { label: 'Cash Position', value: 23.1, unit: 'M', icon: 'dollar', color: '#06B6D4' },
    { label: 'Open Claims', value: 7, unit: '', icon: 'document', color: '#F59E0B' },
  ],
  [PERSONAS.SOPHIE.id]: [
    { label: 'Open RFIs', value: 47, unit: '', icon: 'document', color: '#8B5CF6' },
    { label: 'Quality Score', value: 94.2, unit: '%', icon: 'check', color: '#10B981' },
    { label: 'Safety Score', value: 93.3, unit: '%', icon: 'shield', color: '#3B82F6' },
    { label: 'Punch Items', value: 89, unit: '', icon: 'alert', color: '#F59E0B' },
  ],
  [PERSONAS.JAMES.id]: [
    { label: 'Pipeline Value', value: 89.3, unit: 'M', icon: 'trending', color: '#F59E0B' },
    { label: 'Win Rate', value: 34, unit: '%', icon: 'star', color: '#10B981' },
    { label: 'Active Proposals', value: 18, unit: '', icon: 'document', color: '#3B82F6' },
    { label: 'Avg Deal Size', value: 4.7, unit: 'M', icon: 'dollar', color: '#8B5CF6' },
  ],
};

/**
 * Suggested queries per persona for the query input screen
 * @type {Object<string, Array<string>>}
 */
export const SUGGESTED_QUERIES = {
  [PERSONAS.LUKAS.id]: [
    'Show me project risks',
    'What is the schedule status across my projects?',
    'Give me a portfolio overview',
    'Show me budget status for my projects',
  ],
  [PERSONAS.ELENA.id]: [
    'Show me revenue analysis',
    'What are the budget variances across projects?',
    'Show me cash flow analysis',
    'Show me QS analytics',
  ],
  [PERSONAS.SOPHIE.id]: [
    'Show me open RFIs',
    'Show me quality metrics',
    'Show me safety compliance report',
    'Show me resource allocation',
  ],
  [PERSONAS.JAMES.id]: [
    'Show me the sales pipeline',
    'What is our win rate this quarter?',
    'Show me the revenue forecast',
    'Show me client engagement metrics',
  ],
};

/**
 * Notification mock data per persona
 * @type {Object<string, Array<Object>>}
 */
export const MOCK_NOTIFICATIONS = {
  [PERSONAS.LUKAS.id]: [
    { id: 'notif-l1', type: 'warning', title: 'Schedule Delay Alert', message: 'Marina Bay Tower foundation phase is 14 days behind schedule.', timestamp: '2024-06-01T09:30:00Z', read: false },
    { id: 'notif-l2', type: 'info', title: 'Budget Approval Required', message: 'Highway Extension A12 budget adjustment of $2.4M pending your approval.', timestamp: '2024-06-01T08:15:00Z', read: false },
    { id: 'notif-l3', type: 'success', title: 'Milestone Completed', message: 'Office Complex Delta steel erection phase completed on schedule.', timestamp: '2024-05-31T16:00:00Z', read: true },
  ],
  [PERSONAS.ELENA.id]: [
    { id: 'notif-e1', type: 'warning', title: 'Budget Overrun Alert', message: 'Highway Extension A12 is 7.2% over budget. Review recommended.', timestamp: '2024-06-01T09:00:00Z', read: false },
    { id: 'notif-e2', type: 'info', title: 'Quarterly Report Ready', message: 'Q2 2024 financial report is ready for review.', timestamp: '2024-06-01T07:30:00Z', read: false },
    { id: 'notif-e3', type: 'success', title: 'Payment Received', message: 'City of Metro payment of $4.2M received and processed.', timestamp: '2024-05-31T14:00:00Z', read: true },
  ],
  [PERSONAS.SOPHIE.id]: [
    { id: 'notif-s1', type: 'error', title: 'Overdue RFI', message: 'RFI-2024-0142 for Marina Bay Tower is 14 days overdue.', timestamp: '2024-06-01T08:00:00Z', read: false },
    { id: 'notif-s2', type: 'warning', title: 'Safety Audit Due', message: 'Office Complex Delta safety audit is due by June 5th.', timestamp: '2024-06-01T07:00:00Z', read: false },
    { id: 'notif-s3', type: 'success', title: 'Inspection Passed', message: 'Marina Bay Tower Level 2 structural inspection passed.', timestamp: '2024-05-31T15:30:00Z', read: true },
  ],
  [PERSONAS.JAMES.id]: [
    { id: 'notif-j1', type: 'info', title: 'New Opportunity', message: 'Airport Terminal Expansion RFP received. Value: $45M.', timestamp: '2024-06-01T09:45:00Z', read: false },
    { id: 'notif-j2', type: 'success', title: 'Deal Won', message: 'Residential Tower Greenfield deal closed at $8.7M.', timestamp: '2024-06-01T08:30:00Z', read: false },
    { id: 'notif-j3', type: 'warning', title: 'Stale Opportunity', message: 'University Science Building has been in Qualification for 21 days.', timestamp: '2024-05-31T17:00:00Z', read: true },
  ],
};

/**
 * Finds a mock user by username
 * @param {string} username - The username to search for
 * @returns {Object|null} The user object or null if not found
 */
export function findUserByUsername(username) {
  if (!username || typeof username !== 'string') {
    return null;
  }
  return MOCK_USERS.find((user) => user.username.toLowerCase() === username.toLowerCase()) || null;
}

/**
 * Finds a mock user by email
 * @param {string} email - The email to search for
 * @returns {Object|null} The user object or null if not found
 */
export function findUserByEmail(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }
  return MOCK_USERS.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Finds the best matching query response for a given query and persona
 * @param {string} query - The user's query string
 * @param {string} persona - The persona ID
 * @returns {Object} The matching query response or the default response
 */
export function findQueryResponse(query, persona) {
  if (!query || typeof query !== 'string') {
    return { ...DEFAULT_QUERY_RESPONSE };
  }

  const personaResponses = QUERY_RESPONSES_BY_PERSONA[persona];
  if (!personaResponses || personaResponses.length === 0) {
    return { ...DEFAULT_QUERY_RESPONSE };
  }

  const normalizedQuery = query.toLowerCase().trim();

  let bestMatch = null;
  let bestScore = 0;

  for (const response of personaResponses) {
    let score = 0;

    for (const keyword of response.keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = response;
    }
  }

  if (bestMatch && bestScore > 0) {
    return { ...bestMatch };
  }

  return { ...DEFAULT_QUERY_RESPONSE };
}

/**
 * Gets CTA bubbles for a given CTA context key
 * @param {string} ctaContext - The CTA context key
 * @returns {Array<Object>} Array of CTA bubble objects
 */
export function getCTABubbles(ctaContext) {
  if (!ctaContext || typeof ctaContext !== 'string') {
    return [];
  }
  return CTA_BUBBLES[ctaContext] || [];
}

/**
 * Gets source indicators for a given array of source IDs
 * @param {Array<string>} sourceIds - Array of source system IDs
 * @returns {Array<Object>} Array of source indicator objects
 */
export function getSourceIndicators(sourceIds) {
  if (!Array.isArray(sourceIds)) {
    return [];
  }
  return sourceIds
    .map((id) => SOURCE_INDICATORS[id])
    .filter(Boolean);
}

/**
 * Gets action templates filtered by role/cluster
 * @param {string} cluster - The user's cluster/role
 * @param {Array<string>} [actionIds] - Optional array of specific action IDs to filter
 * @returns {Array<Object>} Array of action template objects
 */
export function getActionTemplates(cluster, actionIds) {
  if (!cluster || typeof cluster !== 'string') {
    return [];
  }

  let templates = ACTION_TEMPLATES.filter(
    (action) => action.requiredRole.includes(cluster)
  );

  if (Array.isArray(actionIds) && actionIds.length > 0) {
    templates = templates.filter((action) => actionIds.includes(action.id));
  }

  return templates;
}

/**
 * Gets an intelligence cluster by domain
 * @param {string} domain - The cluster domain
 * @returns {Object|null} The intelligence cluster object or null
 */
export function getIntelligenceCluster(domain) {
  if (!domain || typeof domain !== 'string') {
    return null;
  }
  return INTELLIGENCE_CLUSTERS.find((cluster) => cluster.domain === domain) || null;
}

/**
 * Gets all intelligence clusters relevant to a persona
 * @param {string} personaId - The persona ID
 * @returns {Array<Object>} Array of relevant intelligence cluster objects
 */
export function getIntelligenceClustersForPersona(personaId) {
  const clusterMapping = {
    [PERSONAS.LUKAS.id]: ['operations', 'portfolio', 'risk'],
    [PERSONAS.ELENA.id]: ['finance', 'risk', 'portfolio'],
    [PERSONAS.SOPHIE.id]: ['engineering', 'operations', 'risk'],
    [PERSONAS.JAMES.id]: ['sales', 'portfolio', 'risk'],
  };

  const domains = clusterMapping[personaId];
  if (!domains) {
    return INTELLIGENCE_CLUSTERS;
  }

  return domains
    .map((domain) => getIntelligenceCluster(domain))
    .filter(Boolean);
}

/**
 * Gets dashboard stats for a persona
 * @param {string} personaId - The persona ID
 * @returns {Array<Object>} Array of dashboard stat objects
 */
export function getDashboardStats(personaId) {
  if (!personaId || typeof personaId !== 'string') {
    return [];
  }
  return DASHBOARD_STATS[personaId] || [];
}

/**
 * Gets suggested queries for a persona
 * @param {string} personaId - The persona ID
 * @returns {Array<string>} Array of suggested query strings
 */
export function getSuggestedQueries(personaId) {
  if (!personaId || typeof personaId !== 'string') {
    return [];
  }
  return SUGGESTED_QUERIES[personaId] || [];
}

/**
 * Gets notifications for a persona
 * @param {string} personaId - The persona ID
 * @param {boolean} [unreadOnly=false] - Whether to return only unread notifications
 * @returns {Array<Object>} Array of notification objects
 */
export function getNotifications(personaId, unreadOnly = false) {
  if (!personaId || typeof personaId !== 'string') {
    return [];
  }

  const notifications = MOCK_NOTIFICATIONS[personaId] || [];

  if (unreadOnly) {
    return notifications.filter((n) => !n.read);
  }

  return notifications;
}