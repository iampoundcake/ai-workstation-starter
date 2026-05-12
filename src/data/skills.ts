// Skills registry — maps domains to skills and how to invoke them

export interface SkillArg {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export interface Skill {
  id: string;
  command: string;       // The full slash command (e.g. "/account agenda")
  label: string;         // Display name on the button
  description: string;   // One-liner shown on hover
  args?: SkillArg[];     // Inline inputs needed before run
  freeform?: boolean;    // If true, show a textarea for any extra context
}

export interface Domain {
  id: string;
  name: string;
  color: string;
  skills: Skill[];
}

export const domains: Domain[] = [
  {
    id: 'admin',
    name: 'General Admin',
    color: 'accent-admin',
    skills: [
      {
        id: 'meeting-capture',
        command: '/meeting capture',
        label: 'Capture Meeting',
        description: 'Pull a transcript, file notes + action items',
        args: [{ name: 'source', label: 'Transcript URL or ID', required: true }],
      },
      {
        id: 'meeting-recap',
        command: '/meeting recap',
        label: 'Quick Recap',
        description: 'One-screen meeting read-out, no file write',
        args: [{ name: 'source', label: 'Transcript URL or ID', required: true }],
      },
      {
        id: 'raw',
        command: '/raw',
        label: 'Capture to Raw',
        description: 'Drop a note, link, or idea into the inbox',
        freeform: true,
      },
      {
        id: 'skill-creator',
        command: '/skill-creator',
        label: 'Build Skill',
        description: 'Create or modify a Claude Code skill',
        freeform: true,
      },
      {
        id: 'aiworkstation-index',
        command: '/aiworkstation index',
        label: 'Index Raw',
        description: 'Classify raw/ files and route them to wiki / output / projects',
      },
    ],
  },
  {
    id: 'pod',
    name: 'AI Pod',
    color: 'accent-pod',
    skills: [
      {
        id: 'roundtable',
        command: '/roundtable',
        label: 'Roundtable',
        description: 'Multi-persona advisory panel',
        args: [{ name: 'team', label: 'Team or personas', placeholder: 'e.g. research, product, design', required: true }],
        freeform: true,
      },
      {
        id: 'persona-creator',
        command: '/persona-creator',
        label: 'Build Persona',
        description: 'Create a new agent persona',
        freeform: true,
      },
    ],
  },
  {
    id: 'account',
    name: 'Account Management',
    color: 'accent-account',
    skills: [
      {
        id: 'account-agenda',
        command: '/account agenda',
        label: 'Meeting Agenda',
        description: 'Generate agenda from last meeting transcript + open threads',
        args: [
          { name: 'client', label: 'Client', required: true },
          { name: 'meeting', label: 'Meeting Keywords', required: true },
        ],
      },
      {
        id: 'account-scope',
        command: '/account scope',
        label: 'Scope Tracker',
        description: 'Track in-scope vs out-of-scope, log scope creep',
        args: [
          { name: 'client', label: 'Client', required: true },
          { name: 'program', label: 'Program', required: true },
        ],
      },
      {
        id: 'account-raci',
        command: '/account raci',
        label: 'RACI Builder',
        description: 'Create or update RACI matrix for a program',
        args: [
          { name: 'client', label: 'Client', required: true },
          { name: 'program', label: 'Program', required: true },
        ],
      },
      {
        id: 'account-qbr',
        command: '/account qbr',
        label: 'QBR Prep',
        description: 'Quarterly business review preparation',
        args: [
          { name: 'client', label: 'Client', required: true },
          { name: 'program', label: 'Program', required: true },
        ],
      },
    ],
  },
];

export interface Routine {
  id: string;
  label: string;
  schedule: string;
}

export const routines: Routine[] = [];
