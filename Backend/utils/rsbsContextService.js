const pool = require('../db');

const formatSchoolLine = (s, extra = '') => {
  const rating =
    s.average_rating != null
      ? Number(s.average_rating).toFixed(1)
      : s.rating_count > 0
        ? (s.rating_total / s.rating_count).toFixed(1)
        : 'N/A';
  const dist = s.distance != null ? ` | ${Number(s.distance).toFixed(1)} km away` : '';
  return `• ${s.name} (${s.type || '—'}, ${s.level || '—'}) — ${s.location || 'Rwanda'} — Rating: ${rating}/5${dist}${extra}`;
};

const detectSchoolIntent = (message) => {
  const m = message.toLowerCase();
  return {
    wantsTopRated:
      /(top|best|highest|most)\s*(rated|rating)?/.test(m) && /school/.test(m),
    wantsNearby:
      /(near me|nearby|closest|around me|near my|schools near)/.test(m),
    wantsList:
      /(list|show|how many|all)\s*(the\s*)?schools/.test(m) || /schools in (rsbs|system|database)/.test(m),
    wantsApply:
      /(how to|how do i)\s*apply/.test(m) && /school/.test(m),
  };
};

/**
 * Fetches live RSBS database context when the user question is school-related.
 */
const buildRsbsContext = async (message, userRole = 'guest', options = {}) => {
  const intent = detectSchoolIntent(message);
  const blocks = [];

  if (!intent.wantsTopRated && !intent.wantsNearby && !intent.wantsList && !intent.wantsApply) {
    return '';
  }

  try {
    if (intent.wantsTopRated) {
      const result = await pool.query(
        `SELECT name, location, type, level, rating_total, rating_count,
                CASE WHEN rating_count > 0 THEN rating_total::FLOAT / rating_count ELSE 0 END AS average_rating
         FROM schools
         ORDER BY average_rating DESC, rating_count DESC, name ASC
         LIMIT 8`
      );
      if (result.rows.length) {
        blocks.push(
          'LIVE RSBS DATA — HIGHEST RATED SCHOOLS (use these facts in your answer):\n' +
            result.rows.map((s) => formatSchoolLine(s)).join('\n')
        );
      } else {
        blocks.push('LIVE RSBS DATA: No schools with ratings yet in the database.');
      }
    }

    if (intent.wantsNearby) {
      const lat = options.latitude != null ? Number(options.latitude) : null;
      const lng = options.longitude != null ? Number(options.longitude) : null;

      if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
        const result = await pool.query(
          `SELECT name, location, type, level, rating_total, rating_count,
                  CASE WHEN rating_count > 0 THEN rating_total::FLOAT / rating_count ELSE 0 END AS average_rating,
                  (6371 * acos(
                    cos(radians($1)) * cos(radians(latitude)) *
                    cos(radians(longitude) - radians($2)) +
                    sin(radians($1)) * sin(radians(latitude))
                  )) AS distance
           FROM schools
           WHERE latitude IS NOT NULL AND longitude IS NOT NULL
           ORDER BY distance ASC
           LIMIT 8`,
          [lat, lng]
        );
        if (result.rows.length) {
          blocks.push(
            `LIVE RSBS DATA — SCHOOLS NEAREST TO USER (${lat.toFixed(4)}, ${lng.toFixed(4)}):\n` +
              result.rows.map((s) => formatSchoolLine(s)).join('\n')
          );
        } else {
          blocks.push(
            'LIVE RSBS DATA: No geolocated schools found near the user. Suggest browsing /student or /home.'
          );
        }
      } else {
        blocks.push(
          'USER ASKED FOR NEARBY SCHOOLS but location was not provided. Tell them to enable location in the browser or name their district (e.g. Kigali), then search on the Home or Student page map.'
        );
      }
    }

    if (intent.wantsList) {
      const result = await pool.query(
        `SELECT COUNT(*)::int AS total FROM schools`
      );
      const total = result.rows[0]?.total ?? 0;
      const sample = await pool.query(
        `SELECT name, location, type, level FROM schools ORDER BY name ASC LIMIT 12`
      );
      blocks.push(
        `LIVE RSBS DATA: ${total} schools registered.\nSample:\n` +
          sample.rows.map((s) => `• ${s.name} — ${s.location} (${s.type}, ${s.level})`).join('\n')
      );
    }

    if (intent.wantsApply) {
      blocks.push(
        `RSBS APPLICATION FLOW: Student → /student → browse schools → Apply → upload documents → leader reviews → email notification. Role: ${userRole}.`
      );
    }
  } catch (err) {
    console.error('RSBS context fetch error:', err.message);
    blocks.push('RSBS data temporarily unavailable; answer from general knowledge and suggest /student or /contact.');
  }

  return blocks.join('\n\n');
};

module.exports = { buildRsbsContext, detectSchoolIntent };
