class AttendanceController < ApplicationController

  def index
    @data = ''
    @data += File.read('lib/assets/data/fake_students.csv')
    gon.attendanceFilter = @data
  end

  def letters
    # TODO: Load actual data.
    csv_string = File.read('lib/assets/data/fake_students.csv')
    @attendance_summary = AttendanceSummary.new({csv_string: csv_string})
    @attendances = @attendance_summary.find(params[:attendance_ids].map(&:to_s))

    respond_to do |format|
      format.pdf { send_pdf(Pdfs::AttendanceLetters.new(@attendance_summary, @attendances, locale: params[:locale].to_s, context: self), "AttendanceLetters.pdf") }
    end
  end
end
