const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation?.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    navigation.classList.remove('is-open');
    menu?.setAttribute('aria-expanded', 'false');
  }
});
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
const jobsList = document.querySelector('#jobs-list');
if (jobsList) loadJobs();
async function loadJobs() {
  const count = document.querySelector('#jobs-count');
  const search = document.querySelector('#job-search');
  try {
    const response = await fetch('jobs.json');
    if (!response.ok) throw new Error('Positions unavailable');
    const jobs = await response.json();
    if (!Array.isArray(jobs)) throw new Error('Invalid position list');
    const render = () => {
      const query = search.value.trim().toLocaleLowerCase();
      const filtered = jobs.filter(job => job.title.toLocaleLowerCase().includes(query));
      count.textContent = `${filtered.length} ${filtered.length === 1 ? 'position' : 'positions'}${query ? ` of ${jobs.length}` : ''}`;
      jobsList.replaceChildren();
      if (!filtered.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        const heading = document.createElement('h3');
        heading.textContent = jobs.length ? 'No matching positions.' : 'New opportunities are on the way.';
        const message = document.createElement('p');
        message.textContent = jobs.length ? 'Try another keyword or clear your search to see all available positions.' : 'We’re preparing our next set of opportunities. Confirmed positions will appear here as they become available. Please check back and apply directly to a listed position.';
        empty.append(heading, message);
        jobsList.append(empty);
        return;
      }
      filtered.forEach(job => {
        const row = document.createElement('article');
        row.className = 'job-row';
        const details = document.createElement('div');
        const title = document.createElement('h3');
        title.textContent = job.title;
        const info = document.createElement('p');
        info.textContent = `Position description · ${job.format} · See document for requirements and location`;
        details.append(title, info);
        const links = document.createElement('div');
        const view = document.createElement('a');
        view.href = job.url;
        view.textContent = 'View description ↗';
        view.setAttribute('aria-label', `View ${job.title} description (${job.format})`);
        const apply = document.createElement('a');
        apply.className = 'apply-link';
        apply.href = `mailto:info@sopliance.com?subject=${encodeURIComponent(`Application: ${job.title}`)}&body=${encodeURIComponent(`Hello SOPliance,\n\nI would like to apply for the ${job.title} position.\n\nPlease find my résumé attached.\n\nName:\nPhone:\nLocation:\n`)}`;
        apply.textContent = 'Apply by email ↗';
        apply.setAttribute('aria-label', `Apply for ${job.title} by email`);
        links.append(view, apply);
        row.append(details, links);
        jobsList.append(row);
      });
    };
    search.disabled = false;
    search.addEventListener('input', render);
    render();
  } catch {
    count.textContent = 'Please contact us for opportunities';
    jobsList.textContent = 'We couldn’t load the position list. Please try again or email info@sopliance.com for current openings.';
  }
}
