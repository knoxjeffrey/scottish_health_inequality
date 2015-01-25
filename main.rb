require 'rubygems'
require 'sinatra'

use Rack::Session::Cookie, :key => 'rack.session',
                           :path => '/',
                           :secret => 'jeff_knox' 
                           
get '/' do
  erb :home
end
                           




