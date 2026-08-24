package com.salon.booking.config;

import com.salon.booking.model.*;
import com.salon.booking.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String defaultPassword = passwordEncoder.encode("password123");

        // 1. Ensure Seed Users Exist
        User admin = userRepository.findByEmail("admin@salon.com").orElseGet(() ->
                userRepository.save(new User("Master Guild Admin", "admin@salon.com", defaultPassword, Role.ADMIN)));
        User owner1 = userRepository.findByEmail("owner1@salon.com").orElseGet(() ->
                userRepository.save(new User("Vikram Sharma", "owner1@salon.com", defaultPassword, Role.OWNER)));
        User owner2 = userRepository.findByEmail("owner2@salon.com").orElseGet(() ->
                userRepository.save(new User("Priya Nair", "owner2@salon.com", defaultPassword, Role.OWNER)));
        User owner3 = userRepository.findByEmail("owner3@salon.com").orElseGet(() ->
                userRepository.save(new User("Alistair Thorne", "owner3@salon.com", defaultPassword, Role.OWNER)));
        User customer1 = userRepository.findByEmail("customer1@salon.com").orElseGet(() ->
                userRepository.save(new User("Rahul Verma", "customer1@salon.com", defaultPassword, Role.CUSTOMER)));
        User customer2 = userRepository.findByEmail("customer2@salon.com").orElseGet(() ->
                userRepository.save(new User("Ananya Iyer", "customer2@salon.com", defaultPassword, Role.CUSTOMER)));

        // Ensure all existing shops have unique photography and Google Maps data
        List<Shop> existingShops = shopRepository.findAll();
        for (Shop s : existingShops) {
            String nameLower = s.getName().toLowerCase();
            if (nameLower.contains("luxe & glow") || nameLower.contains("luxe and glow")) {
                s.setImageUrl("https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80");
                s.setRating(4.8);
                s.setRatingCount(310);
                s.setGoogleMapsUrl("https://maps.google.com/?q=Luxe+Glow+Salon+Indiranagar+Bengaluru");
                s.setTagline("Artisan Organic Spa Treatments & Premium Styling");
            } else if (nameLower.contains("urban men")) {
                s.setImageUrl("https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&w=1200&q=80");
                s.setRating(4.9);
                s.setRatingCount(450);
                s.setGoogleMapsUrl("https://maps.google.com/?q=Urban+Men+Grooming+Koramangala+Bengaluru");
                s.setTagline("Classic Hot Towel Shaves & Precision Beard Grooming");
            } else if (nameLower.contains("elegance")) {
                s.setImageUrl("https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80");
                s.setRating(4.9);
                s.setRatingCount(520);
                s.setGoogleMapsUrl("https://maps.google.com/?q=Elegance+Hair+Beauty+Lavelle+Road+Bengaluru");
                s.setTagline("Deluxe Hair Styling, Gold Facials & Signature Blowdry");
            } else if (nameLower.contains("truefitt")) {
                s.setImageUrl("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80");
            } else if (nameLower.contains("toni & guy") || nameLower.contains("toni and guy")) {
                s.setImageUrl("https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80");
            } else if (nameLower.contains("bounce")) {
                s.setImageUrl("https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1200&q=80");
            } else if (nameLower.contains("bblunt")) {
                s.setImageUrl("https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80");
            } else if (nameLower.contains("aalim")) {
                s.setImageUrl("https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80");
            } else if (nameLower.contains("looks salon")) {
                s.setImageUrl("https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80");
            } else if (nameLower.contains("enrich")) {
                s.setImageUrl("https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80");
            } else if (nameLower.contains("artelire")) {
                s.setImageUrl("https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80");
            } else {
                s.setImageUrl("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80");
            }
            shopRepository.save(s);
        }

        // Also enrich any services missing images
        List<Service> existingServices = serviceRepository.findAll();
        for (Service svc : existingServices) {
            if (svc.getImageUrl() == null) {
                String nameLower = svc.getName().toLowerCase();
                if (nameLower.contains("haircut") || nameLower.contains("styling") || nameLower.contains("cut")) {
                    svc.setImageUrl("https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80");
                    if (svc.getDescription() == null) svc.setDescription("Master artisan scissor styling, neck taper and grooming finish.");
                } else if (nameLower.contains("beard") || nameLower.contains("shave")) {
                    svc.setImageUrl("https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80");
                    if (svc.getDescription() == null) svc.setDescription("Hot towel straight-razor shave with soothing aromatic herbal balm.");
                } else if (nameLower.contains("facial") || nameLower.contains("glow") || nameLower.contains("radiance")) {
                    svc.setImageUrl("https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80");
                    if (svc.getDescription() == null) svc.setDescription("Deep pore herbal exfoliation, steam extraction and revitalizing mask.");
                } else if (nameLower.contains("spa") || nameLower.contains("massage") || nameLower.contains("wash")) {
                    svc.setImageUrl("https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80");
                    if (svc.getDescription() == null) svc.setDescription("Restorative scalp massage and conditioning moisture infusion.");
                } else if (nameLower.contains("pedicure") || nameLower.contains("manicure")) {
                    svc.setImageUrl("https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80");
                    if (svc.getDescription() == null) svc.setDescription("Exfoliating salt scrub, paraffin wax treatment and acupressure therapy.");
                } else {
                    svc.setImageUrl("https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=600&q=80");
                    if (svc.getDescription() == null) svc.setDescription("Bespoke parlour beauty treatment performed by guild specialists.");
                }
                serviceRepository.save(svc);
            }
        }

        // Ensure comprehensive slots exist for all shops for Today and the next 7 days
        LocalDate today = LocalDate.now();
        List<Shop> allCurrentShops = shopRepository.findAll();
        for (Shop s : allCurrentShops) {
            for (int dayOffset = 0; dayOffset <= 6; dayOffset++) {
                LocalDate targetDate = today.plusDays(dayOffset);
                List<Slot> existingForDay = slotRepository.findByShopIdAndDate(s.getId(), targetDate);
                if (existingForDay.isEmpty()) {
                    List<Slot> newDaySlots = Arrays.asList(
                            new Slot(s, targetDate, LocalTime.of(10, 0), LocalTime.of(10, 45), false),
                            new Slot(s, targetDate, LocalTime.of(11, 0), LocalTime.of(11, 45), false),
                            new Slot(s, targetDate, LocalTime.of(12, 0), LocalTime.of(12, 45), false),
                            new Slot(s, targetDate, LocalTime.of(13, 0), LocalTime.of(13, 45), false),
                            new Slot(s, targetDate, LocalTime.of(14, 0), LocalTime.of(14, 45), false),
                            new Slot(s, targetDate, LocalTime.of(15, 0), LocalTime.of(15, 45), false),
                            new Slot(s, targetDate, LocalTime.of(16, 0), LocalTime.of(16, 45), false),
                            new Slot(s, targetDate, LocalTime.of(17, 0), LocalTime.of(17, 45), false),
                            new Slot(s, targetDate, LocalTime.of(18, 0), LocalTime.of(18, 45), false),
                            new Slot(s, targetDate, LocalTime.of(19, 0), LocalTime.of(19, 45), false),
                            new Slot(s, targetDate, LocalTime.of(20, 0), LocalTime.of(20, 45), false)
                    );
                    slotRepository.saveAll(newDaySlots);
                }
            }
        }

        // If salons are already seeded with full dataset (>= 8), done
        if (shopRepository.count() >= 8) {
            logger.info("Database already populated with 8+ Google Maps salons with photos & slots.");
            return;
        }

        logger.info("Populating database with curated Google Maps Salons & Services with photos...");

        // 2. Define 8 Real Google Maps Salons & Studios
        List<Shop> shopsToSave = Arrays.asList(
                new Shop(
                        owner1,
                        "Truefitt & Hill • Heritage Barbershop",
                        "11/1, Walton Road, Lavelle Road, Shanthala Nagar, Bengaluru, Karnataka 560001",
                        LocalTime.of(9, 0),
                        LocalTime.of(21, 0),
                        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
                        4.9,
                        342,
                        "https://maps.google.com/?q=Truefitt+and+Hill+Lavelle+Road+Bengaluru",
                        "Oldest Barbershop in the World • Traditional Royal Grooming & Hot Towels"
                ),
                new Shop(
                        owner1,
                        "Toni & Guy Essensuals Hairdressing",
                        "#598, 12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038",
                        LocalTime.of(9, 30),
                        LocalTime.of(21, 30),
                        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
                        4.8,
                        518,
                        "https://maps.google.com/?q=Toni+and+Guy+Indiranagar+Bengaluru",
                        "Award-winning British High-Fashion Hairdressing & Advanced Creative Styling"
                ),
                new Shop(
                        owner2,
                        "Bounce Salon & Spa • Flagship Parlour",
                        "36, 1st Floor, Vittal Mallya Rd, Shanthala Nagar, Bengaluru, Karnataka 560001",
                        LocalTime.of(10, 0),
                        LocalTime.of(20, 30),
                        "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
                        4.9,
                        680,
                        "https://maps.google.com/?q=Bounce+Salon+and+Spa+Vittal+Mallya+Road",
                        "Luxury Holistic Beauty Care, Aromatherapy Rituals & Premium Hair Design"
                ),
                new Shop(
                        owner2,
                        "BBLUNT Hair Studio & Academy",
                        "Ground Floor, 80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034",
                        LocalTime.of(9, 0),
                        LocalTime.of(20, 0),
                        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
                        4.7,
                        425,
                        "https://maps.google.com/?q=BBLUNT+Koramangala+Bengaluru",
                        "Trendsetting Bollywood Styling, Precision Cuts & Bespoke Hair Treatments"
                ),
                new Shop(
                        owner3,
                        "The Barber Shop by Hakim's Aalim",
                        "24, Linking Road, Bandra West, Mumbai, Maharashtra 400050",
                        LocalTime.of(10, 0),
                        LocalTime.of(22, 0),
                        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80",
                        4.9,
                        890,
                        "https://maps.google.com/?q=Hakims+Aalim+Bandra+Mumbai",
                        "Celebrity Stylist Barber Lounge • Master Fades, Shaves & Tattoo Beard Art"
                ),
                new Shop(
                        owner3,
                        "Looks Salon • Heritage Edition",
                        "Phoenix Marketcity, Whitefield Main Rd, Mahadevapura, Bengaluru, Karnataka 560048",
                        LocalTime.of(10, 0),
                        LocalTime.of(21, 30),
                        "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1200&q=80",
                        4.8,
                        310,
                        "https://maps.google.com/?q=Looks+Salon+Phoenix+Marketcity+Bengaluru",
                        "Contemporary Elegance • Deluxe Skin Glow Facials & Keratin Therapy"
                ),
                new Shop(
                        owner1,
                        "Enrich Beauty & Wellness Lounge",
                        "100 Feet Ring Rd, 5th Phase, J. P. Nagar, Bengaluru, Karnataka 560078",
                        LocalTime.of(9, 0),
                        LocalTime.of(21, 0),
                        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
                        4.7,
                        475,
                        "https://maps.google.com/?q=Enrich+Salon+JP+Nagar+Bengaluru",
                        "Certified Dermatological Beauty Therapies & Rejuvenating Spa Packages"
                ),
                new Shop(
                        owner2,
                        "Artelire Vintage Hair Studio & Spa",
                        "8th Main, 3rd Block, Jayanagar, Bengaluru, Karnataka 560011",
                        LocalTime.of(9, 30),
                        LocalTime.of(20, 30),
                        "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
                        4.9,
                        295,
                        "https://maps.google.com/?q=Artelire+Salon+Jayanagar+Bengaluru",
                        "Artisan Crafted Cuts, Organic Herbal Kesh Therapy & Hot Towel Shaves"
                )
        );

        List<Shop> savedShops = shopRepository.saveAll(shopsToSave);
        logger.info("Saved {} Google Maps salons with photos.", savedShops.size());

        // 3. Define Real Services with High-Res Photos & Descriptions for Each Salon
        List<Service> allServices = new ArrayList<>();

        for (Shop s : savedShops) {
            allServices.add(new Service(
                    s,
                    "Royal Heritage Haircut & Styling",
                    new BigDecimal("550.00"),
                    45,
                    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80",
                    "Bespoke scissor work, neck taper, hot towel wrap and premium styling tonic."
            ));

            allServices.add(new Service(
                    s,
                    "Classic Beard Sculpting & Hot Towel Shave",
                    new BigDecimal("350.00"),
                    30,
                    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80",
                    "Straight razor shave with aromatic essential oils and cooling balm massage."
            ));

            allServices.add(new Service(
                    s,
                    "Botanical Radiance Glow Facial",
                    new BigDecimal("1200.00"),
                    60,
                    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
                    "Deep pore cleansing, herbal exfoliation, steam extraction and gold mask."
            ));

            allServices.add(new Service(
                    s,
                    "Moroccanoil Deep Conditioning Hair Spa",
                    new BigDecimal("1650.00"),
                    55,
                    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80",
                    "Intense moisture infusion with argan oil, ozone steam and pressure point head massage."
            ));

            allServices.add(new Service(
                    s,
                    "Ayurvedic Scalp Detox & Shirodhara Massage",
                    new BigDecimal("850.00"),
                    40,
                    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
                    "Stress-relieving warm herbal oil treatment to stimulate follicles and soothe tension."
            ));

            allServices.add(new Service(
                    s,
                    "Deluxe Spa Pedicure & Foot Reflexology",
                    new BigDecimal("950.00"),
                    50,
                    "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80",
                    "Sea salt scrub, cuticle therapy, paraffin wax soak and acupressure foot massage."
            ));
        }

        serviceRepository.saveAll(allServices);
        logger.info("Saved {} services with photos and descriptions.", allServices.size());

        // 4. Seed Slots for Today and Next 4 Days
        for (Shop s : savedShops) {
            for (int dayOffset = 0; dayOffset <= 4; dayOffset++) {
                LocalDate date = today.plusDays(dayOffset);
                slotRepository.save(new Slot(s, date, LocalTime.of(10, 0), LocalTime.of(10, 45), false));
                slotRepository.save(new Slot(s, date, LocalTime.of(11, 0), LocalTime.of(11, 45), false));
                slotRepository.save(new Slot(s, date, LocalTime.of(12, 0), LocalTime.of(12, 45), false));
                slotRepository.save(new Slot(s, date, LocalTime.of(14, 0), LocalTime.of(14, 45), false));
                slotRepository.save(new Slot(s, date, LocalTime.of(15, 0), LocalTime.of(15, 45), false));
                slotRepository.save(new Slot(s, date, LocalTime.of(16, 0), LocalTime.of(16, 45), false));
                slotRepository.save(new Slot(s, date, LocalTime.of(17, 0), LocalTime.of(17, 45), false));
                slotRepository.save(new Slot(s, date, LocalTime.of(18, 0), LocalTime.of(18, 45), false));
                slotRepository.save(new Slot(s, date, LocalTime.of(19, 0), LocalTime.of(19, 45), false));
            }
        }

        logger.info("Successfully seeded slots for 8 Google Maps salons across 5 days!");
    }
}

