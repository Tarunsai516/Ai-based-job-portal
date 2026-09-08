package com.jobportal.backend.model.enums;

public enum ApplicationStatus {
    APPLIED,
    UNDER_REVIEW,
    SHORTLISTED,
    INTERVIEW_SCHEDULED,
    INTERVIEW_COMPLETED,
    SELECTED,
    REJECTED,
    WITHDRAWN;

    /**
     * Validates whether a transition from the current status to the target status is allowed.
     */
    public boolean canTransitionTo(ApplicationStatus target) {
        return switch (this) {
            case APPLIED -> target == UNDER_REVIEW || target == REJECTED || target == WITHDRAWN;
            case UNDER_REVIEW -> target == SHORTLISTED || target == REJECTED || target == WITHDRAWN;
            case SHORTLISTED -> target == INTERVIEW_SCHEDULED || target == REJECTED || target == WITHDRAWN;
            case INTERVIEW_SCHEDULED -> target == INTERVIEW_COMPLETED || target == REJECTED || target == WITHDRAWN;
            case INTERVIEW_COMPLETED -> target == SELECTED || target == REJECTED;
            case SELECTED, REJECTED, WITHDRAWN -> false;
        };
    }
}
