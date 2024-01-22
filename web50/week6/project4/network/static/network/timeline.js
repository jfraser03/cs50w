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
            let parent = document.createElement('div');
            let element = document.createElement('div');
            let user = document.createElement('p');
            let content = document.createElement('p');
            let like_button = document.createElement('button')
            let like_count = document.createElement('p');
            let timestamp = document.createElement('p');
            let edit = document.createElement('button');
            

            if (timeline != 'profile'){
                edit.style.display = 'none';
            }

            user.innerHTML = post.username;
            content.innerHTML = post.content;
            timestamp.innerHTML = post.timestamp;
            like_count.innerHTML = post.likes;

            // Attach each element to its parent div and organize in the DOM
            element.append(user, content, timestamp, like_count);
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