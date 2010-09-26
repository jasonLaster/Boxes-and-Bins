# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_boxes_session',
  :secret      => '19ab45813be3f0bbefbc943ef146ad3735bab541bb9dc32921742f8100ef71c60a87520bb56c0243023a9964693a5cf07aa8f9e1d2ecf087fb90e3dbd8202e3a'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
