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
            
            // For each post, check to see if the user has liked it
            let liked = false;
            fetch(`/likes/${user_id}/${post.id}`, {
                method: 'GET',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'type': 'check'
                }
            })
            .then(response => response.json())
            .then(data => {
                liked = data;
            })

            like_count.innerHTML = post.likes;

            // Do some client-side processing to display the correct ♡ and number count
            if (liked) {
                like_button.innerHTML = "❤️"
            }
            else {
                like_button.innerHTML = "♡"
            }
            console.log(liked)
            
            // When like button is clicked, change the number + emoji (clientside) + update the database (server-side)
            like_button.addEventListener('click', () => {
                toggle_like(post)
                let likes_int = parseInt(post.likes)
                if (liked) {
                    like_count.innerHTML = likes_int - 1
                }
                else {
                    like_count.innerHTML = likes_int + 1
                }
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

function toggle_like(post) {

    // 
    fetch(`/likes/${user_id}/${post.id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken,
            'type': 'toggle'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
    })
}