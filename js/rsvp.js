document.addEventListener('DOMContentLoaded', init);

let invitedCount = 1;
let invitationCode = null;
let mainGuestName = '';

function el(id) { return document.getElementById(id); }

async function init() {
  const params = new URLSearchParams(window.location.search);
  invitationCode = params.get('code');

  if (!invitationCode) {
    showState('invalidState');
    return;
  }

  try {
    const doc = await db.collection('invitations').doc(invitationCode).get();

    if (!doc.exists) {
      showState('invalidState');
      return;
    }

    const invite = doc.data();
    mainGuestName = invite.guestName || 'Guest';
    invitedCount = invite.invitedCount || 1;

    el('guestNameDisplay').textContent = mainGuestName;
    el('invitedHint').textContent = `You're invited for up to ${invitedCount} guest(s).`;
    el('attendingCount').max = invitedCount;
    el('attendingCount').value = invitedCount;
    el('maxCount').textContent = invitedCount;

    const existingRsvp = await db.collection('rsvps').doc(invitationCode).get();
    if (existingRsvp.exists) {
      const data = existingRsvp.data();
      if (data.attendanceStatus === 'not_attending') {
        el('lblNo').querySelector('input').checked = true;
        toggleAttendingFields(false);
      } else {
        el('lblYes').querySelector('input').checked = true;
        toggleAttendingFields(true);
      }
      el('attendingCount').value = data.attendingCount ?? invitedCount;
      el('memberNames').value = (data.memberNames || []).join('\n');
      el('specialMessage').value = data.specialMessage || '';
      el('submitBtn').textContent = 'Update RSVP';
    } else {
      el('memberNames').value = mainGuestName;
    }

    showState('rsvpForm');
  } catch (err) {
    console.error(err);
    showState('invalidState');
  }

  document.querySelectorAll('input[name="attending"]').forEach(radio => {
    radio.addEventListener('change', (e) => toggleAttendingFields(e.target.value === 'yes'));
  });

  el('rsvpForm').addEventListener('submit', handleSubmit);
}

function toggleAttendingFields(isAttending) {
  el('attendingFields').classList.toggle('hidden', !isAttending);
  el('lblYes').classList.toggle('active', isAttending);
  el('lblNo').classList.toggle('active', !isAttending);
}

function showState(stateId) {
  ['loadingState', 'invalidState', 'rsvpForm', 'thankyouState'].forEach(id => {
    el(id).classList.toggle('hidden', id !== stateId);
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  el('countError').style.display = 'none';

  const attendingRadio = document.querySelector('input[name="attending"]:checked');
  if (!attendingRadio) return;

  const isAttending = attendingRadio.value === 'yes';
  let attendingCount = 0;
  let memberNames = [];

  if (isAttending) {
    attendingCount = parseInt(el('attendingCount').value, 10) || 0;

    if (attendingCount > invitedCount) {
      el('countError').style.display = 'block';
      return;
    }
    if (attendingCount < 0) attendingCount = 0;

    memberNames = el('memberNames').value
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
  }

  const specialMessage = el('specialMessage').value.trim();
  el('submitBtn').disabled = true;
  el('submitBtn').textContent = 'Submitting...';

  try {
    await db.collection('rsvps').doc(invitationCode).set({
      invitationCode,
      guestName: mainGuestName,
      attendanceStatus: isAttending ? 'attending' : 'not_attending',
      attendingCount: isAttending ? attendingCount : 0,
      memberNames,
      specialMessage,
      submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    el('thankyouName').textContent = `, ${mainGuestName} ❤️`;
    showState('thankyouState');
  } catch (err) {
    console.error(err);
    el('submitBtn').disabled = false;
    el('submitBtn').textContent = 'Submit RSVP';
    alert('Something went wrong submitting your RSVP. Please try again.');
  }
}