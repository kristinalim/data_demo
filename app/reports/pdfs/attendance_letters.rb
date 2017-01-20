module Pdfs
  class AttendanceLetters < Base
    attr_accessor :attendance_summary, :attendances

    def initialize(attendance_summary, attendances, pdf_options)
      self.attendance_summary = attendance_summary
      self.attendances = attendances

      super(pdf_options)
    end

    def render
      WickedPdf.new.pdf_from_string(
        context.render_to_string('pdfs/attendance_letters/main', {
          locals: {
            locale: locale,
            attendances: attendances,
            attendance_summary: attendance_summary,
            letter_date: Time.zone.today,
            school_phone: '+0123456789' # TODO: Replace with actual school phone number
          }
        }),
        layout: 'application',
        footer: {
          content: context.render_to_string('pdfs/attendance_letters/footer', {
            locals: {
              attendances: attendances
            },
            layout: false
          })
        }
      )
    end
  end
end
