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
    let uname = timeline.substring(1)
    if (timeline.charAt(0) === '@') {
        profile = true;
    }

    if (profile) {
        show_profile_info(timeline)
    }

    if (timeline == 'all' || (profile && username == uname)) {
        show_new_post()
    }

    load_posts(timeline, 1)
}

// Request a GET response from server to fetch list of post objects
function load_posts(timeline, page_number) {

    let postContainer = document.getElementById('posts-container');
    // FOR PAGINATION:
    if (page_number == 1) {
        postContainer.innerHTML = ''
    }

    fetch(`/posts/${timeline}/${page_number}`)
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
            let edit_container = document.createElement('div')
            let post_container = document.createElement('div')
            

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
                edit_content(post, content, edit, edit_container, post_container);
            })

            // Set post content into container (with not-yet-existing 'editing' field)
            // This is so the two elements look like they exist in the same place when they swap
            post_container.append(content)

            // Attach each element to its parent div and organize in the DOM
            element.append(user, post_container, timestamp, like_button, like_count);

            // Show profile info
            if (timeline.charAt(0) === '@' && post.username == username){
                edit_container.append(edit)
                element.append(edit_container);
            }
                
            parent.append(element);
            postContainer.append(parent);
        })
    })
}

function show_new_post() {
    // Show new post box in DOM with functionality
    let grandparent = document.getElementById('new-post-container')

    let parent = document.createElement('div');
    let form = document.createElement('form')
    let field = document.createElement('textarea')
    let submit = document.createElement('button')

    submit.innerHTML="Submit"
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        new_post(field);
    })

    form.append(field, submit)
    parent.append(form)
    grandparent.append(parent)


}

function new_post(content_field) {
    // Fetch POST request to server
    fetch('/post', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
            'type': 'new',
            'content': content_field.value,
            'post-id': 0
        }
    })
    .then(data => {
        window.location.reload()
    })
}

function show_profile_info(username) {

    let profileContainer = document.getElementById('profile-info-container');
    profileContainer.innerHTML = ''

    // Fetch profile info from an API route
    fetch(`info/${username}`)
    .then(response => response.json())
    .then(data => {
        let follower_count_data = data.followers;
        let following_count_data = data.following;

        // Create HTML elements for profile info
        let parent = document.createElement('div')
        let username_element = document.createElement('h4')
        let follower_container = document.createElement('div')
        let following_container = document.createElement('div')
        let followers = document.createElement('p')
        let following = document.createElement('p')
        let follower_count = document.createElement('p')
        let following_count = document.createElement('p')

        // Assign values to the elements
        username_element.innerHTML = username;
        followers.innerHTML = "Followers:"
        following.innerHTML = "Following"
        follower_count.innerHTML = follower_count_data;
        following_count.innerHTML = following_count_data;

        // Put elements in respective containers and add the master parent
        follower_container.append(followers, follower_count)
        following_container.append(following, following_count)
        parent.append(username_element, follower_container, following_container)
        
        // Add to the existing DOM
        profileContainer.append(parent)
    })
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

function edit_content(post, html_content, edit_button, btn_container, post_container) {
    // Create new button, hide post & edit button
    edit_button.style.display = 'none';
    let save_button = document.createElement('button')
    save_button.innerHTML = 'Save';

    html_content.style.display = 'none';

    // Exchange post for edit field
    let editing_content = document.createElement('textarea')
    editing_content.value = html_content.innerHTML

    // Add the new elements to their respective containers (divs) in the DOM
    post_container.append(editing_content)
    btn_container.append(save_button)
    
    // Execute upon button click
    save_button.addEventListener('click', () => {
        save_edit(post, html_content, edit_button, btn_container, post_container, editing_content, save_button)
    })

    // Cursor auto to the new text field
    editing_content.focus()
    editing_content.addEventListener('keydown', function(event) {
        if (event.key === "Enter") {
            save_edit(post, html_content, edit_button, btn_container, post_container, editing_content, save_button)
        }
    })
}

function save_edit(post, html_content, edit_button, btn_container, post_container, new_content, save_button) {
    // Post content = new content (HTML)
    html_content.innerHTML = new_content.value

    // Change HTML back
    html_content.style.display = 'block';
    post_container.removeChild(new_content)

    // Change the button back
    btn_container.removeChild(save_button)
    edit_button.style.display = 'block';

    console.log("FLERG")

    // POST request to update the post with new contents
    fetch('/post', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
            'type': 'update',
            'content': new_content.value,
            'post-id': post.id
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
    })

}

