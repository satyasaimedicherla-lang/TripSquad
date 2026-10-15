import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const app = document.querySelector('#app');
const config = window.TRIPSQUAD_SUPABASE || {};
const supabase = config.url && config.anonKey && !config.url.includes('YOUR_PROJECT')
  ? createClient(config.url, config.anonKey)
  : null;

const state = {
  session: null,
  profile: null,
  trips: [],
  saved: new Set(),
  loading: false
};

const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[char]));

function notify(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 3500);
}

function userName() {
  return state.profile?.display_name || state.session?.user?.user_metadata?.name ||
    state.session?.user?.email?.split('@')[0] || 'traveller';
}

function nav() {
  const initial = escapeHtml(userName()[0]?.toUpperCase() || 'T');
  return `<header class="app-nav"><nav class="nav">
    <a class="brand" href="#/dashboard">Trip<span>Squad</span></a>
    <div class="nav-links">
      <a href="#/discover">Discover</a>
      <a href="#/create">Create a trip</a>
      <a href="#/settings">Profile</a>
      <button class="nav-signout" id="signout">Sign out</button>
    </div>
    <a href="#/settings" class="avatar">${initial}</a>
  </nav></header>`;
}

function landing() {
  return `<main class="landing"><nav class="nav">
    <a class="brand" href="#/">Trip<span>Squad</span></a>
    <div class="nav-links"><a href="#story">How it works</a><a href="#/discover">Explore trips</a></div>
    <a class="nav-cta" href="#/signup">Start travelling →</a>
  </nav><section class="hero"><div class="eyebrow">TRAVEL BETTER, TOGETHER</div>
    <h1>Go places.<br><em>Find your people.</em></h1>
    <p>Discover trips with transparent costs, meet compatible travellers, and request a real spot in a plan you can actually afford.</p>
    <div class="hero-actions"><a class="btn lime" href="#/signup">Create your account</a><a class="btn outline" href="#/discover">Browse trips</a></div>
  </section><div class="ticker">TRANSPARENT COSTS ✦ REAL TRIP REQUESTS ✦ PEOPLE, NOT PERFORMANCES ✦</div>
  <section id="story" class="story"><div><div class="eyebrow">THE TRIPSQUAD DIFFERENCE</div>
    <h2>Less planning.<br>More <em>living.</em></h2>
    <p>Every listing shows its budget, dates, capacity, and plan. Save the ones that fit, then send a genuine request to join the organiser.</p>
    <a class="link" href="#/discover">See available trips →</a>
  </div><div class="postcard"></div></section>
  <section class="how"><div class="eyebrow">HOW IT WORKS</div><h2>A better way to get away.</h2>
    <div class="steps"><article class="step"><small>01 / DISCOVER</small><h3>Filter for your reality</h3><p>Search by destination, vibe, dates, and per-person budget.</p></article>
    <article class="step"><small>02 / CHECK THE DETAILS</small><h3>Know what you are joining</h3><p>See the itinerary, cost breakdown, capacity, and organiser before you request.</p></article>
    <article class="step"><small>03 / TRAVEL TOGETHER</small><h3>Build the plan with people</h3><p>Organisers approve requests and keep the group moving in one shared plan.</p></article></div>
  </section><section class="final"><div class="eyebrow">YOUR NEXT CHAPTER</div><h2>The world is better with company.</h2><a class="btn" href="#/signup">Join TripSquad →</a></section>
  <footer class="footer"><b>TripSquad</b><span>© 2026 · Go together.</span></footer></main>`;
}

function auth(signup) {
  return `<main class="auth"><aside class="auth-side"><a class="brand" href="#/">Trip<span>Squad</span></a>
    <div><h1>${signup ? 'Good trips begin with a hello.' : 'Welcome back, wanderer.'}</h1>
    <p>${signup ? 'Create a real account and start planning with people who travel like you.' : 'Your saved trips and requests are waiting.'}</p></div>
    <small>Your account is secured by Supabase Auth.</small></aside><section class="auth-main">
    <div class="eyebrow">${signup ? 'JOIN THE SQUAD' : 'WELCOME HOME'}</div><h2>${signup ? 'Create your account' : 'Sign in'}</h2>
    <p>${signup ? 'Use an email you can verify.' : 'Pick up exactly where your plans left off.'}</p>
    ${supabase ? '' : '<p class="auth-warning">Supabase is not configured. Add the project URL and publishable key in supabase-config.js.</p>'}
    <form id="authForm">${signup ? '<div class="field"><label>YOUR NAME</label><input name="name" required maxlength="80" placeholder="e.g. Aanya Sharma"></div>' : ''}
      <div class="field"><label>EMAIL ADDRESS</label><input name="email" type="email" required autocomplete="email" placeholder="you@example.com"></div>
      <div class="field"><label>PASSWORD</label><input name="password" type="password" required minlength="8" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="At least 8 characters"></div>
      ${signup ? '' : '<button id="forgot" type="button" class="link">Forgot your password?</button>'}
      <button class="btn lime" ${supabase ? '' : 'disabled'}>${signup ? 'Create account →' : 'Sign in →'}</button>
    </form><p class="tiny">${signup ? 'Already have an account?' : 'New around here?'} <a class="link" href="#/${signup ? 'login' : 'signup'}">${signup ? 'Sign in' : 'Create an account'}</a></p>
  </section></main>`;
}

function tripCard(trip) {
  const saved = state.saved.has(trip.id);
  return `<article class="card"><div class="cover" style="background-image:url('${escapeHtml(trip.image_url)}')"></div>
    <div class="card-body"><div class="card-meta"><span>${escapeHtml(trip.vibe || 'Open plan')}</span><button class="save-trip ${saved ? 'saved' : ''}" data-save="${trip.id}" aria-label="${saved ? 'Remove saved trip' : 'Save trip'}">${saved ? '♥' : '♡'}</button></div>
    <h3>${escapeHtml(trip.title)}</h3><p class="sub">${escapeHtml(trip.destination)} · ${escapeHtml(trip.start_date)} — ${escapeHtml(trip.end_date)}</p>
    <div class="row"><b>${money(trip.budget_per_person)} <small class="sub">/ person</small></b><a class="fit" href="#/trip/${trip.id}">VIEW DETAILS →</a></div></div></article>`;
}

function discover() {
  return `${nav()}<main class="shell"><div class="eyebrow">OPEN TRIPS</div><h1 class="page-title">Find a trip that fits your life.</h1>
    <div class="filter"><label>SEARCH <input id="search" type="search" placeholder="Goa, mountains, culture…"></label>
      <label>VIBE <select id="vibe"><option value="">All vibes</option><option>Chill</option><option>Adventure</option><option>Culture</option><option>Relaxed</option></select></label>
      <label class="range">UP TO ${money(12000)} <input id="budget" type="range" min="4000" max="40000" step="500" value="12000"></label></div>
    <div class="results-head"><span id="resultCount">Loading trips…</span><a class="link" href="#/settings">Update preferences</a></div><div id="trips" class="grid"></div></main>`;
}

function createTrip() {
  return `${nav()}<main class="shell"><div class="eyebrow">SHARE A PLAN</div><h1 class="page-title">Create a trip people can trust.</h1>
    <p class="sub intro-copy">Add the details travellers need to make an informed request. You can edit or close the trip from your dashboard later.</p>
    <form id="createTripForm" class="trip-form panel">
      <div class="form-grid"><div class="field"><label>TRIP NAME</label><input name="title" required maxlength="120" placeholder="e.g. Monsoon in Munnar"></div>
      <div class="field"><label>DESTINATION</label><input name="destination" required maxlength="80" placeholder="Munnar, Kerala"></div>
      <div class="field"><label>VIBE</label><select name="vibe"><option>Chill</option><option>Adventure</option><option>Culture</option><option>Relaxed</option></select></div>
      <div class="field"><label>BUDGET PER PERSON (₹)</label><input name="budget" type="number" min="1" required placeholder="12000"></div>
      <div class="field"><label>START DATE</label><input name="start_date" type="date" required></div>
      <div class="field"><label>END DATE</label><input name="end_date" type="date" required></div>
      <div class="field"><label>SPOTS AVAILABLE</label><input name="spots_left" type="number" min="1" max="50" value="4" required></div>
      <div class="field"><label>COVER IMAGE URL</label><input name="image_url" type="url" placeholder="https://…"></div></div>
      <div class="field"><label>DESCRIPTION</label><textarea name="description" rows="5" required maxlength="2000" placeholder="What should travellers know about this trip?"></textarea></div>
      <button class="btn lime">Publish trip →</button>
    </form></main>`;
}

function dashboard() {
  const savedTrips = state.trips.filter(trip => state.saved.has(trip.id)).slice(0, 3);
  return `${nav()}<main class="shell"><section class="dash-hero"><div class="eyebrow">YOUR TRAVEL DESK</div><h2>Hey ${escapeHtml(userName().split(' ')[0])},<br>where to next?</h2>
    <p>Start with a trip that has clear dates, clear costs, and room for you.</p><a class="btn lime" href="#/discover">Explore open trips</a></section>
    <div class="dash-grid"><section class="panel"><div class="panel-heading"><h3>Saved trips</h3><a class="link" href="#/discover">Browse all</a></div>
    ${savedTrips.length ? savedTrips.map(tripCard).join('') : '<div class="empty"><b>Your shortlist is empty.</b><p>Save a trip while you browse and it will appear here.</p><a class="btn" href="#/discover">Find a trip</a></div>'}</section>
    <aside class="panel"><h3>Your profile</h3><p class="profile-name">${escapeHtml(userName())}</p><p class="sub">Keep your name and travel preferences up to date so organisers know who is requesting a spot.</p><a class="link" href="#/settings">Edit profile →</a></aside></div></main>`;
}

function detail(id) {
  const trip = state.trips.find(item => String(item.id) === String(id));
  if (!trip) return `${nav()}<main class="shell"><div class="empty"><h2>Trip not found</h2><p>This trip may have closed or been removed.</p><a class="btn" href="#/discover">Back to trips</a></div></main>`;
  return `${nav()}<main class="shell trip"><section><div class="trip-cover" style="background-image:url('${escapeHtml(trip.image_url)}')"></div>
    <div class="eyebrow trip-label">${escapeHtml(trip.vibe || 'OPEN TRIP')} · ${escapeHtml(trip.destination)}</div><h1>${escapeHtml(trip.title)}</h1>
    <p class="sub">${escapeHtml(trip.start_date)} — ${escapeHtml(trip.end_date)} · Organised by ${escapeHtml(trip.organiser_name || 'TripSquad member')}</p>
    <div class="costs">${Object.entries(trip.cost_breakdown || {}).map(([key, value]) => `<div class="cost">${escapeHtml(key)}<b>${money(value)}</b></div>`).join('')}</div>
    <h3>About this trip</h3><p class="detail-copy">${escapeHtml(trip.description || 'The organiser has not added a description yet.')}</p>
    <h3>Itinerary</h3><div class="timeline">${(trip.itinerary || []).map((day, index) => `<article><b>Day ${index + 1} — ${escapeHtml(day.title || day)}</b><p>${escapeHtml(day.description || '')}</p></article>`).join('') || '<p class="sub">The organiser is still shaping the itinerary.</p>'}</div>
  </section><aside class="join"><div class="eyebrow">JOIN REQUEST</div><h2>${money(trip.budget_per_person)}</h2><p>Per person · ${trip.spots_left} spot${trip.spots_left === 1 ? '' : 's'} left</p>
    <button class="btn lime" id="requestJoin" data-trip="${trip.id}">Request to join</button><button class="save-detail" data-save="${trip.id}">${state.saved.has(trip.id) ? '♥ Saved' : '♡ Save trip'}</button>
    <small>Requests are sent to the organiser for approval. No payment is taken here.</small></aside></main>`;
}

function settings() {
  return `${nav()}<main class="shell settings"><section class="settings-panel"><div class="eyebrow">YOUR ACCOUNT</div><h2>Make it yours.</h2>
    <p class="sub">Your email is managed securely by Supabase Auth. Update the profile details organisers see.</p>
    <form id="settingsForm"><div class="field"><label>DISPLAY NAME</label><input name="name" required maxlength="80" value="${escapeHtml(userName())}"></div>
      <div class="field"><label>EMAIL ADDRESS</label><input value="${escapeHtml(state.session?.user?.email || '')}" readonly></div><button class="btn lime">Save profile</button></form>
    <hr><h3>Account security</h3><p class="sub">Password reset and session security are handled by Supabase.</p><button id="resetAccount" class="link">Send password reset email</button>
    <div class="danger"><b>Sign out</b><p class="sub">End this session on this device.</p><button id="signoutSettings" class="link">Sign out of TripSquad</button></div>
  </section></main>`;
}

async function loadTrips() {
  if (!supabase) return;
  const { data, error } = await supabase.from('trips').select('*').eq('status', 'open').order('start_date');
  if (error) { notify(`Could not load trips: ${error.message}`, 'error'); return; }
  state.trips = data || [];
  if (state.session) {
    const saved = await supabase.from('saved_trips').select('trip_id').eq('user_id', state.session.user.id);
    if (!saved.error) state.saved = new Set(saved.data.map(item => item.trip_id));
  }
}

async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) { notify(error.message, 'error'); return; }
  state.session = null; state.profile = null; state.saved.clear(); location.hash = '/'; notify('You are signed out.');
}

function render() {
  const route = location.hash.slice(1) || '/';
  if (!state.session && ['/dashboard', '/discover', '/create', '/settings'].some(path => route === path || route.startsWith('/trip/'))) {
    location.hash = '/login'; return;
  }
  if (route === '/') app.innerHTML = landing();
  else if (route === '/signup') app.innerHTML = auth(true);
  else if (route === '/login') app.innerHTML = auth(false);
  else if (route === '/dashboard') app.innerHTML = dashboard();
  else if (route === '/discover') app.innerHTML = discover();
  else if (route === '/create') app.innerHTML = createTrip();
  else if (route.startsWith('/trip/')) app.innerHTML = detail(route.split('/')[2]);
  else if (route === '/settings') app.innerHTML = settings();
  else app.innerHTML = landing();
  bind(route);
}

function bind(route) {
  document.querySelectorAll('#signout, #signoutSettings').forEach(button => button.onclick = signOut);
  document.querySelectorAll('[data-save]').forEach(button => button.onclick = async () => {
    if (!supabase || !state.session) return;
    const tripId = Number(button.dataset.save);
    if (state.saved.has(tripId)) {
      const { error } = await supabase.from('saved_trips').delete().match({ user_id: state.session.user.id, trip_id: tripId });
      if (error) { notify(error.message, 'error'); return; }
      state.saved.delete(tripId); notify('Removed from saved trips.');
    } else {
      const { error } = await supabase.from('saved_trips').insert({ user_id: state.session.user.id, trip_id: tripId });
      if (error) { notify(error.message, 'error'); return; }
      state.saved.add(tripId); notify('Trip saved.');
    }
    render();
  });
  if (route === '/signup' || route === '/login') {
    document.querySelector('#authForm').onsubmit = async event => {
      event.preventDefault();
      if (!supabase) return;
      const form = new FormData(event.target);
      const result = route === '/signup'
        ? await supabase.auth.signUp({ email: form.get('email'), password: form.get('password'), options: { data: { name: form.get('name') } } })
        : await supabase.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
      if (result.error) { notify(result.error.message, 'error'); return; }
      if (route === '/signup' && !result.data.session) { notify('Check your email to confirm your account.'); return; }
      location.hash = route === '/signup' ? '/dashboard' : '/dashboard';
    };
    const forgot = document.querySelector('#forgot');
    if (forgot) forgot.onclick = async () => {
      const email = document.querySelector('[name=email]').value;
      if (!email) { notify('Enter your email address first.', 'error'); return; }
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}${location.pathname}` });
      notify(error ? error.message : 'Password reset email sent.', error ? 'error' : 'info');
    };
  }
  if (route === '/discover') {
    const refresh = () => {
      const query = document.querySelector('#search').value.toLowerCase();
      const vibe = document.querySelector('#vibe').value;
      const budget = Number(document.querySelector('#budget').value);
      const filtered = state.trips.filter(trip => trip.budget_per_person <= budget && (!vibe || trip.vibe === vibe) &&
        (!query || `${trip.title} ${trip.destination} ${trip.description || ''}`.toLowerCase().includes(query)));
      document.querySelector('#resultCount').textContent = `${filtered.length} trip${filtered.length === 1 ? '' : 's'} available`;
      document.querySelector('#trips').innerHTML = filtered.length ? filtered.map(tripCard).join('') : '<div class="empty"><b>No trips match those filters.</b><p>Try increasing your budget or clearing the search.</p></div>';
      bind('/results');
    };
    document.querySelector('#budget').oninput = event => { event.target.previousSibling.textContent = `UP TO ${money(event.target.value)} `; refresh(); };
    document.querySelectorAll('#search, #vibe').forEach(input => input.oninput = refresh);
    refresh();
  }
  if (route === '/create') {
    document.querySelector('#createTripForm').onsubmit = async event => {
      event.preventDefault();
      const form = new FormData(event.target);
      const { error } = await supabase.from('trips').insert({
        organiser_id: state.session.user.id,
        title: form.get('title'),
        destination: form.get('destination'),
        vibe: form.get('vibe'),
        budget_per_person: Number(form.get('budget')),
        start_date: form.get('start_date'),
        end_date: form.get('end_date'),
        spots_left: Number(form.get('spots_left')),
        image_url: form.get('image_url') || null,
        description: form.get('description')
      });
      if (error) { notify(error.message, 'error'); return; }
      notify('Your trip is live.');
      if (state.session) await loadTrips();
      location.hash = '/dashboard';
    };
  }
  if (route === '/settings') {
    document.querySelector('#settingsForm').onsubmit = async event => {
      event.preventDefault();
      const name = new FormData(event.target).get('name');
      const { error } = await supabase.from('profiles').upsert({ id: state.session.user.id, display_name: name });
      if (error) { notify(error.message, 'error'); return; }
      state.profile = { ...state.profile, display_name: name }; notify('Profile saved.');
    };
    document.querySelector('#resetAccount').onclick = async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(state.session.user.email, { redirectTo: `${location.origin}${location.pathname}` });
      notify(error ? error.message : 'Password reset email sent.', error ? 'error' : 'info');
    };
  }
  if (route.startsWith('/trip/')) {
    document.querySelector('#requestJoin').onclick = async event => {
      const { error } = await supabase.from('trip_requests').insert({ trip_id: Number(event.target.dataset.trip), user_id: state.session.user.id });
      notify(error ? error.message : 'Your request was sent to the organiser.', error ? 'error' : 'info');
      if (!error) event.target.disabled = true;
    };
  }
}

async function ensureProfile(user) {
  const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Traveller';
  const { data, error } = await supabase.from('profiles').upsert({ id: user.id, display_name: name }, { onConflict: 'id' }).select().single();
  if (error) { notify(`Could not load your profile: ${error.message}`, 'error'); return null; }
  return data;
}

async function start() {
  if (!supabase) { render(); document.querySelector('#loader').classList.add('out'); return; }
  const { data, error } = await supabase.auth.getSession();
  if (error) notify(error.message, 'error');
  state.session = data.session;
  if (state.session) {
    state.profile = await ensureProfile(state.session.user);
  }
  await loadTrips();
  supabase.auth.onAuthStateChange(async (_event, session) => {
    state.session = session;
    if (session) { state.profile = await ensureProfile(session.user); await loadTrips(); } else { state.profile = null; state.trips = []; }
    render();
  });
  render();
  document.querySelector('#loader').classList.add('out');
}

window.addEventListener('hashchange', render);
start();
