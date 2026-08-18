package com.spaservice.config;

import com.spaservice.entity.*;
import com.spaservice.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final WorkingStaffRepository staffRepository;
    private final StaffProfilePhotoRepository photoRepository;
    private final StaffDailyCheckinRepository checkinRepository;
    private final SpaServiceRepository serviceRepository;
    private final AgentRepository agentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, BranchRepository branchRepository, WorkingStaffRepository staffRepository, StaffProfilePhotoRepository photoRepository, StaffDailyCheckinRepository checkinRepository, SpaServiceRepository serviceRepository, AgentRepository agentRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
        this.staffRepository = staffRepository;
        this.photoRepository = photoRepository;
        this.checkinRepository = checkinRepository;
        this.serviceRepository = serviceRepository;
        this.agentRepository = agentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded with initial data.");
            return;
        }

        log.info("Seeding initial SpaService database...");

        // 1. Create Super Admin
        User superAdmin = User.builder()
                .fullName("Super Admin")
                .email("admin@serenehaven.com")
                .phone("+91 9876543210")
                .passwordHash(passwordEncoder.encode("Admin@1234"))
                .role(Role.SUPER_ADMIN)
                .isVerified(true)
                .isActive(true)
                .build();
        superAdmin = userRepository.save(superAdmin);

        // 2. Create Sample Branches with real geo-coordinates
        Branch branch1 = Branch.builder()
                .name("Serene Haven — Koramangala")
                .address("142 5th Block, 80 Feet Road, Koramangala")
                .city("Bangalore")
                .state("Karnataka")
                .pincode("560034")
                .phone("+91 80 4123 4567")
                .latitude(new BigDecimal("12.935143"))
                .longitude(new BigDecimal("77.624696"))
                .mapsUrl("https://www.google.com/maps?q=12.935143,77.624696")
                .openTime(LocalTime.of(9, 0))
                .closeTime(LocalTime.of(21, 0))
                .isActive(true)
                .createdBy(superAdmin.getId())
                .build();

        Branch branch2 = Branch.builder()
                .name("Serene Haven — Indiranagar")
                .address("789 100ft Road, HAL 2nd Stage, Indiranagar")
                .city("Bangalore")
                .state("Karnataka")
                .pincode("560038")
                .phone("+91 80 4987 6543")
                .latitude(new BigDecimal("12.978369"))
                .longitude(new BigDecimal("77.640831"))
                .mapsUrl("https://www.google.com/maps?q=12.978369,77.640831")
                .openTime(LocalTime.of(9, 0))
                .closeTime(LocalTime.of(21, 0))
                .isActive(true)
                .createdBy(superAdmin.getId())
                .build();

        Branch branch3 = Branch.builder()
                .name("Serene Haven — Anna Nagar")
                .address("2nd Avenue, Block AA, Anna Nagar")
                .city("Chennai")
                .state("Tamil Nadu")
                .pincode("600040")
                .phone("+91 44 2621 1122")
                .latitude(new BigDecimal("13.085026"))
                .longitude(new BigDecimal("80.210123"))
                .mapsUrl("https://www.google.com/maps?q=13.085026,80.210123")
                .openTime(LocalTime.of(9, 0))
                .closeTime(LocalTime.of(21, 0))
                .isActive(true)
                .createdBy(superAdmin.getId())
                .build();

        branchRepository.saveAll(List.of(branch1, branch2, branch3));

        // 3. Create Sample Services
        SpaServiceEntity s1 = SpaServiceEntity.builder()
                .name("Swedish Aromatherapy Massage")
                .category("Massage")
                .durationMinutes(60)
                .price(new BigDecimal("1499.00"))
                .description("Gentle flowing strokes combined with pure organic essential oils for deep holistic relaxation.")
                .imageUrl("https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=80")
                .isActive(true)
                .build();

        SpaServiceEntity s2 = SpaServiceEntity.builder()
                .name("Deep Tissue Muscle Recovery")
                .category("Massage")
                .durationMinutes(90)
                .price(new BigDecimal("2199.00"))
                .description("Firm targeted acupressure targeting deep muscle fibers and chronic strain.")
                .imageUrl("https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&auto=format&fit=crop&q=80")
                .isActive(true)
                .build();

        SpaServiceEntity s3 = SpaServiceEntity.builder()
                .name("Hydra-Glow Botanical Facial")
                .category("Facials")
                .durationMinutes(60)
                .price(new BigDecimal("1899.00"))
                .description("Deep pore cleansing, hyaluronic acid infusion, and antioxidant botanical hydration.")
                .imageUrl("https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80")
                .isActive(true)
                .build();

        SpaServiceEntity s4 = SpaServiceEntity.builder()
                .name("Dead Sea Mineral Body Scrub & Wrap")
                .category("Body Care")
                .durationMinutes(75)
                .price(new BigDecimal("2499.00"))
                .description("Therapeutic exfoliating salts followed by detoxifying thermal mud wrap.")
                .imageUrl("https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&auto=format&fit=crop&q=80")
                .isActive(true)
                .build();

        serviceRepository.saveAll(List.of(s1, s2, s3, s4));

        // 4. Create Working Staff
        WorkingStaff staff1 = WorkingStaff.builder()
                .branch(branch1)
                .name("Ananya Rao")
                .specialization("Swedish Aromatherapy & Reflexology")
                .bio("Certified holistic therapist with 8+ years of expertise in relaxation and lymphatic drainage.")
                .galleryPhotoUrls("https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&auto=format&fit=crop&q=80")
                .isActive(true)
                .build();

        WorkingStaff staff2 = WorkingStaff.builder()
                .branch(branch1)
                .name("Divya Sharma")
                .specialization("Deep Tissue & Hot Stone Therapy")
                .bio("Specialist in sports recovery, neuromuscular release, and therapeutic heated stone rituals.")
                .galleryPhotoUrls("https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80")
                .isActive(true)
                .build();

        WorkingStaff staff3 = WorkingStaff.builder()
                .branch(branch1)
                .name("Meena Thapa")
                .specialization("Hydra Facials & Skin Revitalization")
                .bio("Clinical esthetician certified in organic botanical skincare and lymphatic facial massage.")
                .galleryPhotoUrls("https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&auto=format&fit=crop&q=80")
                .isActive(true)
                .build();

        staffRepository.saveAll(List.of(staff1, staff2, staff3));

        // 5. Staff Profile Photos
        StaffProfilePhoto photo1 = StaffProfilePhoto.builder()
                .staff(staff1)
                .photoUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80")
                .uploadedBy(superAdmin.getId())
                .build();

        StaffProfilePhoto photo2 = StaffProfilePhoto.builder()
                .staff(staff2)
                .photoUrl("https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80")
                .uploadedBy(superAdmin.getId())
                .build();

        StaffProfilePhoto photo3 = StaffProfilePhoto.builder()
                .staff(staff3)
                .photoUrl("https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80")
                .uploadedBy(superAdmin.getId())
                .build();

        photoRepository.saveAll(List.of(photo1, photo2, photo3));

        // 6. Create Agent
        User agentUser = User.builder()
                .fullName("Koramangala Frontdesk Agent")
                .email("agent.blr@serenehaven.com")
                .phone("+91 9876543211")
                .passwordHash(passwordEncoder.encode("Agent@1234"))
                .role(Role.AGENT)
                .isVerified(true)
                .isActive(true)
                .build();
        agentUser = userRepository.save(agentUser);

        Agent agent = Agent.builder()
                .user(agentUser)
                .assignedBranch(branch1)
                .createdByAdminId(superAdmin.getId())
                .isActive(true)
                .build();
        agentRepository.save(agent);

        // 7. Seed Checkin
        LocalDate today = LocalDate.now();
        StaffDailyCheckin checkin1 = StaffDailyCheckin.builder()
                .staff(staff1)
                .branch(branch1)
                .checkinDate(today)
                .status(CheckinStatus.PRESENT)
                .confirmedByAgentId(agentUser.getId())
                .build();

        StaffDailyCheckin checkin2 = StaffDailyCheckin.builder()
                .staff(staff2)
                .branch(branch1)
                .checkinDate(today)
                .status(CheckinStatus.PRESENT)
                .confirmedByAgentId(agentUser.getId())
                .build();

        checkinRepository.saveAll(List.of(checkin1, checkin2));

        // 8. Demo Client
        User clientUser = User.builder()
                .fullName("Rahul Verma")
                .email("client@example.com")
                .phone("+91 9123456789")
                .passwordHash(passwordEncoder.encode("Client@1234"))
                .role(Role.CLIENT)
                .isVerified(true)
                .isActive(true)
                .build();
        userRepository.save(clientUser);

        log.info("Database seeding complete! Default Admin: admin@serenehaven.com / Admin@1234 | Agent: agent.blr@serenehaven.com / Agent@1234 | Client: client@example.com / Client@1234");
    }
}
