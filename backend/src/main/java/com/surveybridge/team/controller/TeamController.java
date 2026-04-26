package com.surveybridge.team.controller;

import com.surveybridge.common.CurrentUserContext;
import com.surveybridge.team.dto.InviteRequest;
import com.surveybridge.team.dto.TeamMemberDto;
import com.surveybridge.team.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/team")
@RequiredArgsConstructor
@Tag(name = "Team")
public class TeamController {

    private final TeamService teamService;
    private final CurrentUserContext ctx;

    @GetMapping
    @Operation(summary = "List team members")
    public List<TeamMemberDto> list() {
        return teamService.listMembers(ctx.getClientId());
    }

    @PostMapping("/invite")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Invite a team member")
    public TeamMemberDto invite(@Valid @RequestBody InviteRequest req) {
        return teamService.inviteMember(ctx.getClientId(), req);
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove a team member")
    public void remove(@PathVariable UUID userId) {
        teamService.removeMember(ctx.getClientId(), userId);
    }
}
