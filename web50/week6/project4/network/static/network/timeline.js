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

            // Populate HTML fields with post data
            user.innerHTML = post.username;
            content.innerHTML = post.content;
            timestamp.innerHTML = post.timestamp;
            like_count.innerHTML = post.likes;
            edit.innerHTML = "Edit"

            // Check liked status for post, updating ♡
            check_like(post, like_button)
            
            // Update count + ♡ and update db.
            like_button.addEventListener('click', () => {
                toggle_like(post, like_count, like_button)
            })

            // Edit content functionality
            edit.addEventListener('click', () => {
                edit_content(post, content, edit, element);
            })

            // Attach each element to its parent div and organize in the DOM
            element.append(user, content, timestamp, like_button, like_count);

            // Show edit post btn ONLY for user's profile
            if (timeline.charAt(0) === '@' && post.username == username){
                element.append(edit);
            }

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
    
    // Create HTML elements for profile info
    let parent = document.createElement('div')
    let element = document.createElement('div')
    let username = document.createElement('h4')
    let followers = document.createElement('p')
    let following = document.createElement('p')
    let follower_count = document.createElement('p')
    let folowing_count = document.createElement('p')

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

function edit_content(post, html_content, edit_button, html_element) {
    // Create new button, hide post
    edit_button.innerHTML = 'Save';
    html_content.style.display = 'none';


    // Exchange post for edit field
    let editing_content = document.createElement('textArea')
    editing_content.value = html_content.innerHTML
    html_element.append(editing_content)
    
    // cursor auto go to editing_content

    // Execute upon button click
    edit_button.addEventListener('click', () => {
        let contents = editing_content.value
        save_edit(post, html_content, edit_button, html_element, editing_content, contents)
    })

}

function save_edit(post, html_content, edit_button, html_element, new_content, contents) {
    // Post content = new content (HTML)
    html_content.innerHTML = new_content.innerHTML

    // Change HTML back
    html_content.style.display = 'block'
    html_element.remove(new_content)

    // POST request to update the post with new contents
    fetch('/post', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
            'type': 'update',
            'content': new_content.innerHTML,
            'post_id': post.id
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
    })

    // Change the button back
    edit_button.innerHTML = "Edit"
}