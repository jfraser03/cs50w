document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.getElementById('compose-form').addEventListener('submit', function(event) {
    event.preventDefault();
    send_email();
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
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
      emails.push(email);
    });  
    // Parse through the list of email objects and turn them into formatted HTML elements
    emails.forEach(email => {
      let element = document.createElement('div');
      let sender = document.createElement('p');
      let subject = document.createElement('p');
      let timestamp = document.createElement('p');

      // Reflect 'opened' status in background color of each email
      if (email.read == false) {
        element.style.backgroundColor = 'white';
      } else {
        element.style.backgroundColor = 'lightgray';
      }

      // Give the elements identifiers for the css styling/layout properties
      element.classList.add('email-preview');
      sender.classList.add('sender');
      subject.classList.add('subject');
      timestamp.classList.add('timestamp');

      // Populate each field with it's JSON object content
      sender.textContent = email.sender;
      subject.textContent = email.subject;
      timestamp.textContent = email.timestamp;

      console.log("test")

      
      // Attach each element to it's parent div and organize in the DOM
      element.append(sender, subject, timestamp)
      emailsView.append(element)
    })
          
  });
  console.log(emails)
}

function send_email() {
  console.log("hello")

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox('sent');
  });
}