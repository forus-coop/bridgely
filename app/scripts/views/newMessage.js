/*global bridgelyApp, Backbone, JST*/

bridgelyApp.Views = bridgelyApp.Views || {};

(function () {
    'use strict';

    bridgelyApp.Views.newMessageView = Backbone.View.extend({

        template: JST['app/scripts/templates/newMessage.ejs'],
        el: $('<form />'),

        render: function() {
          this.delegateEvents();
          this.$el.html( this.template );
          $('#content').html( this.el );
          this.$("textarea").limiter(160, $("#chars"));

          if( !bridgelyApp.session.get('company') ) {
            this.$('button[type=submit]').prop('disabled', true).text('Select a company first...');
          }

          return this.el;
        },
        events: {
          'submit' : 'sendMessage',
          'click #success-button' : 'next'
        },
        sendMessage: function(event) {
          event.preventDefault();
          this.$('button[type=submit]').prop('disabled', true);

          var recipients = bridgelyApp.session.get('new_message_employee_ids');
          if( recipients !== 'all' ) {
            recipients = recipients.join();
          }

          $.ajax({
            type: 'POST',
            url: bridgelyApp.apiUrl + '/messages',
            headers: {
              // left this in bc ajaxSetup headers didn't apply here?
              'Authorization': "Token token="+bridgelyApp.session.get('auth_token')
            },
            data: {
              message: {
                body: this.$('textarea').val(),
                employee_ids: recipients,
                company_id: bridgelyApp.session.get('company').id
              }
            },
            success: function() {
              console.log('message sent successfully');
              bridgelyApp.session.resetNewMessageEmployeeIds();
              $('#successModal').modal({
                backdrop: 'static',
                keyboard: false
              });
            },
            error: function() {
              //TODO: Error screen
              console.log('mesaage send failed!!')
              bridgelyApp.session.resetNewMessageEmployeeIds();
            }
          })
        },
        next: function() {
          this.$('#successModal').on('hidden.bs.modal', function () {
            bridgelyApp.MessageRouter.navigate('message-history', {trigger: true});
          })

          this.$('#successModal').modal('hide');
        }

    });

})();
