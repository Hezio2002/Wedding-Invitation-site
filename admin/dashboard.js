let allInvitations = [];
let allRsvps = {}; // keyed by invitation code

function el(id) { return document.getElementById(id); }

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    initDashboard();
  }
});

el('logoutBtn').addEventListener('click', () => auth.signOut());

function initDashboard() {
  db.collection('invitations').orderBy('createdAt', 'desc').onSnapshot(snap => {
    allInvitations = snap.docs.map(d => ({ code: d.id, ...d.data() }));
    render();
  });

  db.collection('rsvps').onSnapshot(snap => {
    allRsvps = {};
    snap.docs.forEach(d => { allRsvps[d.id] = d.data(); });
    render();
  });

  el('toggleCreateBtn').addEventListener('click', () => {
    const form = el('createForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  });

  el('createForm').addEventListener('submit', handleCreateInvitation);
  el('copyLinkBtn').addEventListener('click', copyGeneratedLink);
  el('searchInput').addEventListener('input', render);
  el('statusFilter').addEventListener('change', render);
  el('typeFilter').addEventListener('change', render);
  el('modalCloseBtn').addEventListener('click', () => el('modalOverlay').style.display = 'none');
}

async function handleCreateInvitation(e) {
  e.preventDefault();

  const name = el('inviteName').value.trim();
  const type = el('inviteType').value;
  const count = parseInt(el('inviteCount').value, 10) || 1;
  const phone = el('invitePhone').value.trim().replace(/[^0-9]/g, '');
  const members = el('inviteMembers').value
    .split('\n').map(m => m.trim()).filter(m => m.length > 0);

  const code = 'WED' + Math.floor(1000 + Math.random() * 9000);

  await db.collection('invitations').doc(code).set({
    guestName: name,
    guestType: type,
    invitedCount: count,
    phone,
    memberNames: members,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  const link = `${window.location.origin}${window.location.pathname.replace('admin/dashboard.html', '')}index.html?code=${code}`;

  el('linkResultName').textContent = name;
  el('generatedLink').value = link;

  const waText = encodeURIComponent(
    `Dear ${name},\n\nWe are delighted to invite you to celebrate our wedding! Please open your invitation here:\n${link}`
  );
  el('waLinkBtn').href = phone
    ? `https://wa.me/${phone}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  el('linkResult').style.display = 'block';
  el('createForm').reset();
  el('createForm').style.display = 'none';
}

function copyGeneratedLink() {
  const input = el('generatedLink');
  input.select();
  navigator.clipboard.writeText(input.value).then(() => {
    el('copyLinkBtn').textContent = 'Copied!';
    setTimeout(() => { el('copyLinkBtn').textContent = 'Copy Link'; }, 1500);
  });
}

function getStatus(code) {
  const rsvp = allRsvps[code];
  if (!rsvp) return 'pending';
  return rsvp.attendanceStatus;
}

function render() {
  const search = el('searchInput').value.toLowerCase();
  const statusFilter = el('statusFilter').value;
  const typeFilter = el('typeFilter').value;

  let totalInvites = 0, invitedGuests = 0, attending = 0, notAttending = 0, pending = 0;
  const rows = [];

  allInvitations.forEach(inv => {
    totalInvites++;
    invitedGuests += inv.invitedCount || 0;
    const status = getStatus(inv.code);
    const rsvp = allRsvps[inv.code];
    const attendingCount = rsvp ? (rsvp.attendingCount || 0) : 0;

    if (status === 'attending') attending += attendingCount;
    if (status === 'not_attending') notAttending++;
    if (status === 'pending') pending++;

    if (search && !inv.guestName.toLowerCase().includes(search)) return;
    if (statusFilter !== 'all' && status !== statusFilter) return;
    if (typeFilter !== 'all' && inv.guestType !== typeFilter) return;

    rows.push({ inv, rsvp, status, attendingCount });
  });

  el('statTotalInvites').textContent = totalInvites;
  el('statInvitedGuests').textContent = invitedGuests;
  el('statAttending').textContent = attending;
  el('statNotAttending').textContent = notAttending;
  el('statPending').textContent = pending;

  el('guestTableBody').innerHTML = rows.map(({ inv, status, attendingCount }) => `
    <tr>
      <td data-label="Guest">${inv.guestName}</td>
      <td data-label="Type">${capitalize(inv.guestType)}</td>
      <td data-label="Invited">${inv.invitedCount}</td>
      <td data-label="Attending">${attendingCount}</td>
      <td data-label="Status"><span class="badge ${status}">${statusLabel(status)}</span></td>
      <td data-label="Actions"><button class="view-btn" onclick="openModal('${inv.code}')">View</button></td>
    </tr>
  `).join('') || `<tr><td colspan="6" style="text-align:center; padding:20px;">No guests found.</td></tr>`;
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function statusLabel(s) {
  return s === 'attending' ? 'Attending' : s === 'not_attending' ? 'Not Attending' : 'Pending';
}

function openModal(code) {
  const inv = allInvitations.find(i => i.code === code);
  const rsvp = allRsvps[code];
  const status = getStatus(code);

  el('modalGuestName').textContent = inv.guestName;
  el('modalType').textContent = capitalize(inv.guestType);
  el('modalInvited').textContent = inv.invitedCount;
  el('modalAttending').textContent = rsvp ? (rsvp.attendingCount || 0) : '—';
  const members = rsvp ? rsvp.memberNames : inv.memberNames;
  el('modalMembers').textContent = (members && members.length) ? members.join(', ') : '—';
  el('modalStatus').innerHTML = `<span class="badge ${status}">${statusLabel(status)}</span>`;
  el('modalMessage').textContent = (rsvp && rsvp.specialMessage) ? rsvp.specialMessage : '—';

  const link = `${window.location.origin}${window.location.pathname.replace('admin/dashboard.html', '')}index.html?code=${code}`;
  el('modalLink').innerHTML = `<a href="${link}" target="_blank">${link}</a>`;

  el('modalOverlay').style.display = 'flex';
}