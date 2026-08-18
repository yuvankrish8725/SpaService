package com.spaservice.security;

import com.spaservice.entity.Agent;
import com.spaservice.entity.User;
import com.spaservice.repository.AgentRepository;
import com.spaservice.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AgentRepository agentRepository;

    public CustomUserDetailsService(UserRepository userRepository, AgentRepository agentRepository) {
        this.userRepository = userRepository;
        this.agentRepository = agentRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        UUID assignedBranchId = null;
        if (user.getRole() == com.spaservice.entity.Role.AGENT) {
            assignedBranchId = agentRepository.findByUserId(user.getId())
                    .map(a -> a.getAssignedBranch().getId())
                    .orElse(null);
        }

        return new CustomUserDetails(user, assignedBranchId);
    }
}
