console.log('UoL intro skipper enabled');

/**
 * Video event handler to skip to 9 seconds if current time is less
 */
function skipHandler() {
    if (this.currentTime < 9) {
        console.log('Skipping UoL video intro');
        this.currentTime = 9;
    }
}

/**
 * Finds the video element and skips the first 9 seconds
 */
function skipIntro() {
    // This is called for every DOM mutation so needs to be fast.
    // Could use querySelector but getElementsByClassName is
    // much faster
    const container = document.getElementsByClassName('video-main-player-container')[0];
    if (!container) {
        return;
    }

    const video = container.getElementsByTagName('video')[0];
    if (video && video.dataset.intro != 'skipped') {
        video.dataset.intro = 'skipped';

        // loadedmetadata seems to be the corrent event to use but doesn't
        // always work, might be Coursera adjusting it sometimes?
        // Using canplay seems to fix the issue.
        video.addEventListener('loadedmetadata', skipHandler, { once: true });
        video.addEventListener('canplay', skipHandler, { once: true });
    }
}

// Detect react mutations and fix video if needed
const observer = new MutationObserver(skipIntro);
observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});

