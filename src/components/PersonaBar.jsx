import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';
import { PERSONAS } from '../utils/constants.js';

/**
 * Cluster color accent mappings
 * @type {Object<string, Object>}
 */
const CLUSTER_STYLES = {
  operations: {
    badge: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30',
    dot: 'bg-accent-blue',
    glow: 'shadow-[0_0_6px_rgba(59,130,246,0.6)]',
    accent: 'border-b-accent-blue',
    label: 'Operations',
  },
  finance: {
    badge: 'bg-accent-green/20 text-accent-green border-accent-green/30',
    dot: 'bg-accent-green',
    glow: 'shadow-[0_0_6px_rgba(16,185,129,0.6)]',
    accent: 'border-b-accent-green',
    label: 'Finance',
  },
  engineering: {
    badge: 'bg-accent-purple/20 text-accent-purple border-accent-purple/30',
    dot: 'bg-accent-purple',
    glow: 'shadow-[0_0_6px_rgba(139,92,246,0.6)]',
    accent: 'border-b-accent-purple',
    label: 'Engineering',
  },
  sales: {
    badge: 'bg-accent-orange/20 text-accent-orange border-accent-orange/30',
    dot: 'bg-accent-orange',
    glow: 'shadow-[0_0_6px_rgba(245,158,11,0.6)]',
    accent: 'border-b-accent-orange',
    label: 'Sales',
  },
};

/**
 * Default cluster style for unknown clusters
 * @type {Object}
 */
const DEFAULT_CLUSTER_STYLE = {
  badge: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  dot: 'bg-slate-500',
  glow: '',
  accent: 'border-b-slate-500',
  label: 'Unknown',
};

/**
 * Persona avatar color mappings
 * @type {Object<string, string>}
 */
const PERSONA_AVATAR_COLORS = {
  lukas: 'from-accent-blue to-accent-cyan',
  elena: 'from-accent-green to-accent-cyan',
  sophie: 'from-accent-purple to-accent-pink',
  james: 'from-accent-orange to-accent-blue',
};

/**
 * Default avatar gradient for unknown personas
 * @type {string}
 */
const DEFAULT_AVATAR_GRADIENT = 'from-slate-500 to-slate-400';

/**
 * Resolves the cluster style for a given cluster
 * @param {string} cluster - The cluster identifier
 * @returns {Object} The cluster style object
 */
function getClusterStyle(cluster) {
  if (!cluster || typeof cluster !== 'string') {
    return DEFAULT_CLUSTER_STYLE;
  }
  const normalized = cluster.toLowerCase().trim();
  return CLUSTER_STYLES[normalized] || DEFAULT_CLUSTER_STYLE;
}

/**
 * Resolves the avatar gradient for a given persona
 * @param {string} persona - The persona identifier
 * @returns {string} The Tailwind gradient classes
 */
function getAvatarGradient(persona) {
  if (!persona || typeof persona !== 'string') {
    return DEFAULT_AVATAR_GRADIENT;
  }
  const normalized = persona.toLowerCase().trim();
  return PERSONA_AVATAR_COLORS[normalized] || DEFAULT_AVATAR_GRADIENT;
}

/**
 * Resolves the persona display name
 * @param {string} persona - The persona identifier
 * @returns {string} The display name
 */
function getPersonaDisplayName(persona) {
  if (!persona || typeof persona !== 'string') {
    return 'User';
  }

  const normalized = persona.toLowerCase().trim();
  const personaKey = Object.keys(PERSONAS).find(
    (key) => PERSONAS[key].id === normalized
  );

  if (personaKey) {
    return PERSONAS[personaKey].name;
  }

  // Capitalize first letter as fallback
  return persona.charAt(0).toUpperCase() + persona.slice(1);
}

/**
 * Resolves the persona initials for the avatar
 * @param {string} persona - The persona identifier
 * @returns {string} The initials string (1-2 characters)
 */
function getPersonaInitials(persona) {
  const name = getPersonaDisplayName(persona);
  if (!name) {
    return '?';
  }
  return name.charAt(0).toUpperCase();
}

/**
 * Avatar component for the persona
 * @param {Object} props
 * @param {string} props.persona - The persona identifier
 * @returns {React.ReactElement}
 */
function PersonaAvatar({ persona }) {
  const gradient = getAvatarGradient(persona);
  const initials = getPersonaInitials(persona);

  return (
    <div
      className={classNames(
        'flex items-center justify-center',
        'w-9 h-9 sm:w-10 sm:h-10',
        'rounded-full',
        'bg-gradient-to-br',
        gradient,
        'text-white text-sm sm:text-base font-bold',
        'flex-shrink-0',
        'shadow-glass-sm'
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

PersonaAvatar.propTypes = {
  persona: PropTypes.string,
};

/**
 * Cluster badge component
 * @param {Object} props
 * @param {string} props.cluster - The cluster identifier
 * @returns {React.ReactElement}
 */
function ClusterBadge({ cluster }) {
  const style = getClusterStyle(cluster);

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5',
        'px-2.5 py-1',
        'rounded-full',
        'text-xs font-semibold uppercase tracking-wider',
        'border',
        style.badge
      )}
    >
      <span
        className={classNames(
          'block w-1.5 h-1.5 rounded-full',
          style.dot,
          style.glow
        )}
        aria-hidden="true"
      />
      {style.label}
    </span>
  );
}

ClusterBadge.propTypes = {
  cluster: PropTypes.string.isRequired,
};

/**
 * Persona identification bar component showing current user's persona avatar,
 * name, role, and active cluster. Displayed at top of authenticated screens.
 * Includes persona-specific color accents and responsive layout.
 *
 * @param {Object} props
 * @param {string} props.persona - The persona identifier (e.g., 'lukas', 'elena', 'sophie', 'james')
 * @param {string} [props.role] - The persona's job title/role
 * @param {string} [props.currentCluster] - The active intelligence cluster
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement|null} The persona bar component or null if no persona
 */
export function PersonaBar({ persona, role, currentCluster, className }) {
  if (!persona || typeof persona !== 'string') {
    return null;
  }

  const displayName = getPersonaDisplayName(persona);
  const clusterStyle = getClusterStyle(currentCluster);

  return (
    <div
      className={classNames(
        'w-full',
        'glass-card-sm',
        'border-b-2',
        clusterStyle.accent,
        'px-4 sm:px-6 py-3 sm:py-4',
        'transition-all duration-300 ease-in-out',
        'animate-fade-in',
        className
      )}
      role="banner"
      aria-label={`Logged in as ${displayName}`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Avatar + Name + Role */}
        <div className="flex items-center gap-3 min-w-0">
          <PersonaAvatar persona={persona} />

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-semibold text-slate-100 truncate">
              {displayName}
            </h2>
            {role && (
              <p className="text-xs sm:text-sm text-slate-400 truncate">
                {role}
              </p>
            )}
          </div>
        </div>

        {/* Right: Cluster Badge */}
        {currentCluster && (
          <div className="flex-shrink-0">
            <ClusterBadge cluster={currentCluster} />
          </div>
        )}
      </div>
    </div>
  );
}

PersonaBar.propTypes = {
  persona: PropTypes.string.isRequired,
  role: PropTypes.string,
  currentCluster: PropTypes.string,
  className: PropTypes.string,
};

export default PersonaBar;