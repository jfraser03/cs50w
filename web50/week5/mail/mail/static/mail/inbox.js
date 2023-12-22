document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.getElementById('compose-form').addEventListener('submit', function(event) {
    event.preventDefault();
    send_email();
  });
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Retrieve the div object that will contain the list of emails
  let emailsView = document.getElementById('emails-view');

  // Request a GET response from the server to fetch list of email objects
  let emails = []
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emailList => {
    emailList.forEach(email => {
      let parentElement = document.createElement('div');
      let element = document.createElement('div');
      let sender = document.createElement('p');
      let subject = document.createElement('p');
      let timestamp = document.createElement('p');
      let archive = document.createElement('button')

      if (mailbox == 'sent'){
        archive.style.display = 'none';
      }


      // Reflect 'opened' status in background color of each email
      if (email.read == false) {
        element.style.backgroundColor = 'white';
      } else {
        element.style.backgroundColor = '#f2f5f3';
      }

      // Give the elements identifiers for the css styling/layout properties
      parentElement.classList.add('preview-w-button')
      element.classList.add('email-preview');
      sender.classList.add('sender');
      subject.classList.add('subject');
      timestamp.classList.add('timestamp');
      archive.classList.add('btn', 'btn-sm', 'btn-outline-primary');

      // Populate each field with it's JSON object content
      sender.innerHTML = email.sender;
      subject.innerHTML = email.subject;
      timestamp.innerHTML = email.timestamp;
    
      // Linkify our element. Upon click, send to email via ID routing
      element.addEventListener('click', function() {
        load_email(email)
      });

      // Add appropriate Archive button (depending on mailbox, & therefore, status)
      if (email.archived) {
        archive.innerHTML = "Unarchive"
      } else {
        archive.innerHTML = "Archive"
      }

      archive.addEventListener('click', function() {
        // Toggle the archive status and send a PUT request to update DB
        console.log(email.archived)
        email.archived = !email.archived
        console.log(email.archive)

        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: email.archived
          })
        })
        location.reload()
      })
      
      // Attach each element to it's parent div and organize in the DOM
      element.append(sender, subject, timestamp)
      parentElement.append(element)
      parentElement.append(archive)
      emailsView.append(parentElement)
    })
  })
}

function send_email() {

  // Send a POST requet with the populated fields 
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox('sent');
  })
})
}

function load_email(email) {
  
  // Show email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Populate text fields
  document.querySelector('#email-sender').innerHTML = email.sender;
  document. querySelector('#email-recipients').innerHTML = email.recipients;
  document.querySelector('#email-subject').innerHTML = email.subject;
  document.querySelector('#email-body').innerHTML = email.body;
  document.querySelector('#email-timestamp').innerHTML = email.timestamp;

  // Retreive and hide (by default) the reply button
  reply = document.querySelector('#reply-button');
  reply.style.display = 'none';
  
  // If the client is viewing an email NOT sent by them:
  if (email.sender != clientEmail){

    // Show reply functionality
    reply.style.display = 'block';

    reply.addEventListener('click', function() {
      console.log("Add reply functionality.. probably show the compose form below the current one.")
    })

    // Update email status to 'read'
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
  }
}