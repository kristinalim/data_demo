class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  protected

  def send_pdf(report, filename)
    send_data report.render, type: 'application/pdf', filename: filename, disposition: 'attachment'
  end
end
