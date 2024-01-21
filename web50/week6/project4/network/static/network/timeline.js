document.addEventListener('DOMContentLoaded', function() {
    

    // Going to start out by coding the all-posts view
    // Once complete, I will contain it in a block to hide-show it's views
    // Along with others. Method from inbox.js (week5)

    // Load following timeline
    document.querySelector('#following').addEventListener('click', () => {
        load_wall()
        load_timeline('following');
    })
    
    let route = window.location.pathname.substring(1)
    if (route.charAt(0) === '@') {
        load_profile(route)
        load_timeline(route)
    }
    else if (window.location.href.endsWith('#')) {
        load_wall()
        load_timeline('following')
    }
    // Load all posts by default
    else {
        load_wall()
        load_timeline('all')
    }

    // Add pathing for Creating post here (same as inbox)
})

// Request a GET response from server to fetch list of post objects
function load_timeline(timeline) {

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
            let timestamp = document.createElement('p');
            let edit = document.createElement('button');

            if (timeline != 'profile'){
                edit.style.display = 'none';
            }

            user.innerHTML = post.username;
            content.innerHTML = post.content;
            timestamp.innerHTML = post.timestamp;

            // Attach each element to its parent div and organize in the DOM
            element.append(user, content, timestamp);
            parent.append(element);
            postContainer.append(parent);
        })
    })
}

function load_wall() {

}

function load_profile(user) {

    // Do some stuff (show followers and stuff like that)

}