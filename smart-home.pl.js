window.prologProgram = `
% =====================================
% 1. Rooms (Facts)
% =====================================

room(living_room).
room(bedroom).
room(kitchen).
room(bathroom).
room(childrens_room).

% =====================================
% 2. Initial State
% =====================================

initial_state([
    light_status(living_room, off),
    light_status(bedroom, off),
    light_status(kitchen, off),
    light_status(bathroom, off),
    light_status(childrens_room, off)
]).

% =====================================
% 3. Goal States (4 scenarios)
% =====================================

% Added Morning goal: Living Room + Kitchen + Children's Room ON
goal_state(morning, [
    light_status(living_room, on),
    light_status(kitchen, on),
    light_status(childrens_room, on),
    light_status(bedroom, off),
    light_status(bathroom, off)
]).

% Added Night goal: All lights OFF
goal_state(night, [
    light_status(living_room, off),
    light_status(bedroom, off),
    light_status(kitchen, off),
    light_status(bathroom, off),
    light_status(childrens_room, off)
]).

% Added Movie goal: Living Room ON only
goal_state(movie, [
    light_status(living_room, on),
    light_status(bedroom, off),
    light_status(kitchen, off),
    light_status(bathroom, off),
    light_status(childrens_room, off)
]).

% Added Party goal: All lights ON
goal_state(party, [
    light_status(living_room, on),
    light_status(bedroom, on),
    light_status(kitchen, on),
    light_status(bathroom, on),
    light_status(childrens_room, on)
]).

% =====================================
% 4. Actions (turn_on / turn_off)
% =====================================

action(
    turn_on(Room),
    [light_status(Room, off)],   % Preconditions
    [light_status(Room, on)],    % Add List
    [light_status(Room, off)]    % Delete List
) :- room(Room).

action(
    turn_off(Room),
    [light_status(Room, on)],
    [light_status(Room, off)],
    [light_status(Room, on)]
) :- room(Room).

% =====================================
% 5. Achieves / Satisfies
% =====================================

achieves(Goal, State) :-
    member(Goal, State).

satisfies([], _).
satisfies([Goal|Rest], State) :-
    achieves(Goal, State),
    satisfies(Rest, State).

% =====================================
% 6. Apply Action
% =====================================

apply(Action, OldState, NewState) :-
    action(Action, Preconditions, Adds, Deletes),
    satisfies(Preconditions, OldState),
    subtract(OldState, Deletes, TempState),
    union(TempState, Adds, NewState).

% =====================================
% 7. Planner
% =====================================

% stop when goals satisfied
plan(Goals, State, _, []) :-
    satisfies(Goals, State), !.     % stop searching more solutions (important!)

% recursive planning
plan(Goals, State, History, [Action|Plan]) :-
    action(Action, Preconditions, Adds, Deletes),
    apply(Action, State, NewState),
    \+ member(NewState, History),
    plan(Goals, NewState, [State|History], Plan).

% =====================================
% 8. Solve Plan (Updated for multiple goals)
% =====================================

% Updated solve_plan to accept PlanType parameter
solve_plan(PlanType, Plan) :-
    initial_state(I),
    goal_state(PlanType, G),
    plan(G, I, [], Plan),
    !.   % <<< prevents infinite alternative plans

% =====================================
% 9. Helper Predicates
% =====================================

print_state([]).
print_state([H|T]) :-
    write(H), nl,
    print_state(T).

print_plan([]).
print_plan([H|T]) :-
    write(' ? '), write(H), nl,
    print_plan(T).

run_smart_home :-
    initial_state(I),
    goal_state(morning, G),
    write('Initial State:'), nl,
    print_state(I), nl,
    solve_plan(morning, Plan),
    write('Generated Plan:'), nl,
    print_plan(Plan), nl,
    write('Goal:'), nl,
    print_state(G).

% =====================================
% 10. Testing Queries (Commented)
% =====================================

% ?- solve_plan(morning, Plan).
% ?- solve_plan(night, Plan).
% ?- solve_plan(movie, Plan).
% ?- solve_plan(party, Plan).
% ?- run_smart_home.
% ?- initial_state(S), print_state(S).
% ?- goal_state(morning, G), print_state(G).
% ?- apply(turn_on(kitchen), [light_status(kitchen, off)], New).
`