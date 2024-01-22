document.addEventListener('DOMContentLoaded', function() {
    
    // Load 'following' timeline
    document.querySelector('#following').addEventListener('click', () => {
        load_timeline('following');
    })
    
    let route = window.location.pathname.substring(1)
    if (route.charAt(0) === '@') {
        load_timeline(route)
    }
    else if (window.location.href.endsWith('#')) {
        load_timeline('following')
    }
    // Load all posts by default
    else {
        load_timeline('all')
    }

})

function load_timeline(timeline) {


    let profile = false;
    let username = timeline.substring(1)
    if (timeline.charAt(0) === '@') {
        profile = true;
    }

    if (profile) {
        show_profile_info(username)
    }

    if (! profile || "{{ user.username }}" == username) {
        show_new_post()
    }
    
    load_posts(timeline)


}

// Request a GET response from server to fetch list of post objects
function load_posts(timeline) {

    let postContainer = document.getElementById('posts-container');
    postContainer.innerHTML = ''

    fetch(`/posts/${timeline}`)
    .then(response => response.json())
    .then(postList => {
        postList.forEach(post => {

            // Create HTML elements for post
            let parent = document.createElement('div');
            let element = document.createElement('div');
            let user = document.createElement('p');
            let content = document.createElement('p');
            let like_button = document.createElement('button')
            let like_count = document.createElement('p');
            let timestamp = document.createElement('p');
            let edit = document.createElement('button');

            // Show edit post btn ONLY for user's profile
            if (timeline != 'profile'){
                edit.style.display = 'none';
            }

            // Populate HTML fields with post data
            user.innerHTML = post.username;
            content.innerHTML = post.content;
            timestamp.innerHTML = post.timestamp;
            like_count.innerHTML = post.likes;

            // Check liked status for post, updating ♡
            check_like(post, like_button)
            
            // Update count + ♡ and update db.
            like_button.addEventListener('click', () => {
                toggle_like(post, like_count, like_button)
            })

            // Attach each element to its parent div and organize in the DOM
            element.append(user, content, timestamp, like_button, like_count);
            parent.append(element);
            postContainer.append(parent);
        })
    })
}

function show_new_post() {
    // Show new post box in DOM with functionality
}

function show_profile_info(user) {
    // Fetch profile info from an API route

}

function toggle_like(post, like_element, like_button) {

    // Toggle like db when triggered
    fetch(`/likes/${user_id}/${post.id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken,
            'type': 'toggle'
        }
    })
    .then(response => response.json())
    
    // Update UI like count and ♡
    .then(data => {
        let likes = parseInt(like_element.innerHTML)
        // data returns a Bool based on like status
        if (data) {
            likes += 1
        }
        else {
            likes -=1
        }
        // Update HTML element
        like_element.innerHTML = likes;

        // Update heart status
        heart_status(data, like_button)
    })
}

function check_like(post, like_button) {
    return fetch(`/likes/${user_id}/${post.id}`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrftoken,
            'type': 'check'
        }
    })
    .then(response => response.json())
    .then(data => {
        // data returns True/False
        heart_status(data, like_button)
    })
}

function heart_status(liked, btn) {
    if (liked) {
        btn.innerHTML = "❤️"
    }
    else {
        btn.innerHTML = "♡"
    }
}
