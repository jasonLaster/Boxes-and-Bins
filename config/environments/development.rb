# Settings specified here will take precedence over those in config/environment.rb

# In the development environment your application's code is reloaded on
# every request.  This slows down response time but is perfect for development
# since you don't have to restart the webserver when you make code changes.
config.cache_classes = false

# Log error messages when you accidentally call methods on nil.
config.whiny_nils = true

# Show full error reports and disable caching
config.action_controller.consider_all_requests_local = true
config.action_view.debug_rjs                         = true
config.action_controller.perform_caching             = false

SITE_URL  = "localhost:3000"  

# Mail config
config.action_mailer.raise_delivery_errors = true
config.action_mailer.default_url_options = { :host => SITE_URL }

config.action_mailer.delivery_method = :smtp # change to SMTP to actually send mail in the host environment
config.action_mailer.smtp_settings = {
  :enable_starttls_auto => true,
  :address => "smtp.gmail.com",
  :port => 587,
  :domain => "somethingRemarkable.com",
  :authentication => :plain,
  :user_name => "jason.laster.11@gmail.com",
  :password => "joel1024"
}
