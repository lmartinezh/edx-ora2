/**
Tests for the edit settings view.
**/
describe("OpenAssessment.EditSettingsView", function() {

    var StubView = function(name, descriptionText) {
        this.name = name;
        this.isValid = true;
        this.validationErrors = [];

        this.description = function() {
            return { dummy: descriptionText };
        };

        var _enabled = true;
        this.isEnabled = function(isEnabled) {
            if (typeof(isEnabled) !== "undefined") { this._enabled = isEnabled; }
            return this._enabled;
        };

        this.validate = function() {
            return this.isValid;
        };

        this.validationErrors = function() { return this.validationErrors; };
        this.clearValidationErrors = function() {};
    };

    var testValidateDate = function(datetimeControl, expectedError) {
        // Test an invalid datetime
        datetimeControl.datetime("invalid", "invalid");
        expect(view.validate()).toBe(false);
        expect(view.validationErrors()).toContain(expectedError);

        view.clearValidationErrors();

        // Test a valid datetime
        datetimeControl.datetime("2014-04-05", "00:00");
        expect(view.validate()).toBe(true);
        expect(view.validationErrors()).toEqual([]);
    };

    var view = null;
    var assessmentViews = null;

    // The Peer and Self Editor ID's
    var PEER = "oa_peer_assessment_editor";
    var SELF = "oa_self_assessment_editor";
    var AI = "oa_ai_assessment_editor";
    var TRAINING = "oa_student_training_editor";

    beforeEach(function() {
        // Load the DOM fixture
        loadFixtures('oa_edit.html');

        // Create the stub assessment views
        assessmentViews = {};
        assessmentViews[SELF] = new StubView("self-assessment", "Self assessment description");
        assessmentViews[PEER] = new StubView("peer-assessment", "Peer assessment description");
        assessmentViews[AI] = new StubView("ai-assessment", "Example Based assessment description");
        assessmentViews[TRAINING] = new StubView("student-training", "Student Training description");

        // Create the view
        var element = $("#oa_basic_settings_editor").get(0);
        view = new OpenAssessment.EditSettingsView(element, assessmentViews);
        view.submissionStart("2014-01-01", "00:00");
        view.submissionDue("2014-03-04", "00:00");
    });

    it("sets and loads display name", function() {
        view.displayName("");
        expect(view.displayName()).toEqual("");
        view.displayName("This is the name of the problem!");
        expect(view.displayName()).toEqual("This is the name of the problem!");
    });

    it("sets and loads the submission start/due dates", function() {
        view.submissionStart("2014-04-01", "12:34");
        expect(view.submissionStart()).toEqual("2014-04-01T12:34");

        view.submissionDue("2014-05-02", "12:34");
        expect(view.submissionDue()).toEqual("2014-05-02T12:34");
    });

    it("sets and loads the image enabled state", function() {
        view.imageSubmissionEnabled(true);
        expect(view.imageSubmissionEnabled()).toBe(true);
        view.imageSubmissionEnabled(false);
        expect(view.imageSubmissionEnabled()).toBe(false);
    });

    it("builds a description of enabled assessments", function() {
        // Depends on the template having an original order
        // of training --> peer --> self --> ai

        // Disable all assessments, and expect an empty description
        assessmentViews[PEER].isEnabled(false);
        assessmentViews[SELF].isEnabled(false);
        assessmentViews[AI].isEnabled(false);
        assessmentViews[TRAINING].isEnabled(false);
        expect(view.assessmentsDescription()).toEqual([]);

        // Enable the first assessment only
        assessmentViews[PEER].isEnabled(false);
        assessmentViews[SELF].isEnabled(true);
        assessmentViews[AI].isEnabled(false);
        assessmentViews[TRAINING].isEnabled(false);
        expect(view.assessmentsDescription()).toEqual([
            {
                name: "self-assessment",
                dummy: "Self assessment description"
            }
        ]);

        // Enable the second assessment only
        assessmentViews[PEER].isEnabled(true);
        assessmentViews[SELF].isEnabled(false);
        assessmentViews[AI].isEnabled(false);
        assessmentViews[TRAINING].isEnabled(false);
        expect(view.assessmentsDescription()).toEqual([
            {
                name: "peer-assessment",
                dummy: "Peer assessment description"
            }
        ]);

        // Enable both assessments
        assessmentViews[PEER].isEnabled(true);
        assessmentViews[SELF].isEnabled(true);
        assessmentViews[AI].isEnabled(false);
        assessmentViews[TRAINING].isEnabled(false);
        expect(view.assessmentsDescription()).toEqual([
            {
                name: "peer-assessment",
                dummy: "Peer assessment description"
            },
            {
                name: "self-assessment",
                dummy: "Self assessment description"
            }
        ]);
    });

    it("validates submission start datetime fields", function() {
        testValidateDate(
            view.startDatetimeControl,
            "Submission start is invalid"
        );
    });

    it("validates submission due datetime fields", function() {
        testValidateDate(
            view.dueDatetimeControl,
            "Submission due is invalid"
        );
    });

    it("validates assessment views", function() {
        // Simulate one of the assessment views being invalid
        assessmentViews[PEER].isValid = false;
        assessmentViews[PEER].validationErrors = ["test error"];

        // Expect that the parent view is also invalid
        expect(view.validate()).toBe(false);
        expect(view.validationErrors()).toContain("test error");
    });
});
