document.addEventListener('DOMContentLoaded', () => {
  console.log('Wedding invitation page loaded ✅');
  startCountdown();
  showPersonalGreeting();
});

/**
 * IMPORTANT: this should match the date/time on Page 1.
 * Currently set to: Friday, January 22, 2027 at 3:30 PM.
 * Format: 'YYYY-MM-DDTHH:MM:SS'  (24-hour clock, so 3:30 PM = 15:30:00)
 */
const WEDDING_DATE = new Date('2027-01-22T15:30:00');

function startCountdown() {
  const daysEl  = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl  = document.getElementById('cd-mins');
  const secsEl  = document.getElementById('cd-secs');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  function pad(num) {
    return String(num).padStart(2, '0');
  }

  function update() {
    const now = new Date();
    let diff = WEDDING_DATE - now;

    if (diff <= 0) {
      daysEl.textContent  = '00';
      hoursEl.textContent = '00';
      minsEl.textContent  = '00';
      secsEl.textContent  = '00';
      clearInterval(timer);
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent  = pad(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent  = pad(minutes);
    secsEl.textContent  = pad(seconds);
  }

  update();
  const timer = setInterval(update, 1000);
}

// If this invitation link has ?code=WED001 in it, look up that guest's
// info in Firebase and personalize both the hero greeting (Page 1) and
// the "Your Invitation" card (Page 5). If there's no code, or the code
// isn't found, both sections just keep their default text.
async function showPersonalGreeting() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  const greetingEl = document.getElementById('personalGreeting');
  const nameEl = document.getElementById('inviteGuestName');
  const typeTextEl = document.getElementById('inviteTypeText');
  const rsvpBtn = document.getElementById('inviteRsvpBtn');

  if (rsvpBtn && code) {
    rsvpBtn.href = `rsvp.html?code=${code}`;
  }

  if (!code || typeof db === 'undefined') return;

  try {
    const doc = await db.collection('invitations').doc(code).get();
    if (!doc.exists) return;

    const data = doc.data();
    const name = data.guestName || 'Guest';
    const type = data.guestType || 'individual';

    if (greetingEl) {
      greetingEl.textContent = `Dear ${name},`;
      greetingEl.style.display = 'block';
    }

    if (nameEl) nameEl.textContent = name;

    const typeMessages = {
      individual: 'You are personally invited to celebrate our wedding with us.',
      couple: 'You and your partner are invited to celebrate our wedding with us.',
      family: 'You and your family are warmly invited to celebrate our wedding with us.'
    };
    if (typeTextEl) {
      typeTextEl.textContent = typeMessages[type] || typeMessages.individual;
    }
  } catch (err) {
    console.error('Could not load guest info:', err);
  }
}












