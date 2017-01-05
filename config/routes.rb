Rails.application.routes.draw do
  root to: 'home#index'
  resources :home, only: :index
  resources :attendance, only: :index do
    get :letter, on: :member
  end
end
