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

const TOP_RATED_SQL = `
  SELECT name, location, type, level, rating_total, rating_count,
         CASE WHEN rating_count > 0 THEN rating_total::FLOAT / rating_count ELSE 0 END AS average_rating
  FROM schools
  ORDER BY average_rating DESC, rating_count DESC, name ASC
  LIMIT $1
`;

const detectSchoolIntent = (message) => {
  const m = message.toLowerCase();
  const mentionsSchool =
    /\b(school|schools|rsbs|academy|college|institution|lycee|ecole)\b/.test(m);

  const wantsTopRated =
    mentionsSchool &&
    /\b(top|best|better|highest|most|recommend|compare|ranking|rating|rated|score|which\s+is|according to)\b/.test(
      m
    );

  const wantsNearby =
    mentionsSchool &&
    /\b(near me|nearby|closest|around me|near my|schools near)\b/.test(m);

  const wantsList =
    /\b(list|show|how many|all)\s*(the\s*)?schools\b/.test(m) ||
    /\bschools in (rsbs|system|database|rwanda|kigali)\b/.test(m);

  const locationMatch = m.match(
    /\b(kigali|musanze|huye|butare|rubavu|nyagatare|rusizi|karongi|ngoma|rwamagana|kayonza|gicumbi|nyanza|district)\b/
  );

  const wantsLocation = mentionsSchool && Boolean(locationMatch);

  const wantsApply =
    /\b(how to|how do i)\s*apply\b/.test(m) && mentionsSchool;

  const wantsSchoolData = mentionsSchool;

  return {
    wantsTopRated,
    wantsNearby,
    wantsList,
    wantsLocation,
    locationTerm: locationMatch ? locationMatch[1] : null,
    wantsApply,
    wantsSchoolData,
  };
};

const fetchTopRatedBlock = async (limit = 10) => {
  const result = await pool.query(TOP_RATED_SQL, [limit]);
  if (!result.rows.length) {
    return 'LIVE RSBS DATA: No schools with ratings yet in the database.';
  }
  return (
    'LIVE RSBS DATA — HIGHEST RATED SCHOOLS (cite these names and ratings in your answer):\n' +
    result.rows.map((s) => formatSchoolLine(s)).join('\n')
  );
};

/**
 * Fetches live RSBS database context when the user question is school-related.
 */
const buildRsbsContext = async (message, userRole = 'guest', options = {}) => {
  const intent = detectSchoolIntent(message);
  const blocks = [];

  if (!intent.wantsSchoolData && !intent.wantsApply) {
    return '';
  }

  try {
    if (intent.wantsTopRated || (intent.wantsSchoolData && !intent.wantsNearby && !intent.wantsList)) {
      blocks.push(await fetchTopRatedBlock(intent.wantsTopRated ? 10 : 8));
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
      } else if (!intent.wantsTopRated) {
        blocks.push(
          'USER ASKED FOR NEARBY SCHOOLS but location was not provided. Tell them to enable location in the browser or name their district (e.g. Kigali), then search on the Home or Student page map.'
        );
      }
    }

    if (intent.wantsLocation && intent.locationTerm) {
      const result = await pool.query(
        `SELECT name, location, type, level, rating_total, rating_count,
                CASE WHEN rating_count > 0 THEN rating_total::FLOAT / rating_count ELSE 0 END AS average_rating
         FROM schools
         WHERE LOWER(location) LIKE $1 OR LOWER(name) LIKE $1
         ORDER BY average_rating DESC, rating_count DESC, name ASC
         LIMIT 8`,
        [`%${intent.locationTerm}%`]
      );
      if (result.rows.length) {
        blocks.push(
          `LIVE RSBS DATA — SCHOOLS IN ${intent.locationTerm.toUpperCase()}:\n` +
            result.rows.map((s) => formatSchoolLine(s)).join('\n')
        );
      }
    }

    if (intent.wantsList) {
      const result = await pool.query(`SELECT COUNT(*)::int AS total FROM schools`);
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

    if (blocks.length === 0 && intent.wantsSchoolData) {
      blocks.push(await fetchTopRatedBlock(5));
    }
  } catch (err) {
    console.error('RSBS context fetch error:', err.message);
    blocks.push(
      'RSBS data temporarily unavailable; suggest browsing /student or /home for live school listings.'
    );
  }

  return blocks.join('\n\n');
};

module.exports = { buildRsbsContext, detectSchoolIntent };
