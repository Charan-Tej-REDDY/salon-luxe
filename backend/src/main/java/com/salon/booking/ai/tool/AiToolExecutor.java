package com.salon.booking.ai.tool;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Central dispatcher for AI tool/function calls.
 * Routes tool invocations from the LLM to the appropriate tool implementation.
 * Validates parameters and handles errors gracefully.
 */
@Component
public class AiToolExecutor {

    private static final Logger logger = LoggerFactory.getLogger(AiToolExecutor.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private ServiceSearchTool serviceSearchTool;

    @Autowired
    private SalonSearchTool salonSearchTool;

    @Autowired
    private AvailabilityTool availabilityTool;

    @Autowired
    private SalonDetailsTool salonDetailsTool;

    @Autowired
    private BookingTool bookingTool;

    @Autowired
    private MyBookingsTool myBookingsTool;

    /**
     * Executes a tool call by name with the given arguments JSON string.
     *
     * @param toolName      The name of the tool to execute
     * @param argumentsJson The JSON string of arguments from the LLM
     * @return The tool execution result as a JSON string
     */
    public String executeTool(String toolName, String argumentsJson) {
        long start = System.currentTimeMillis();
        logger.info("Executing tool: {} with arguments: {}", toolName, argumentsJson);

        try {
            Map<String, Object> params = parseArguments(argumentsJson);

            String result = switch (toolName) {
                case "searchServices" -> serviceSearchTool.execute(params);
                case "searchSalons" -> salonSearchTool.execute(params);
                case "getAvailableSlots" -> availabilityTool.execute(params);
                case "getSalonDetails" -> salonDetailsTool.execute(params);
                case "createBooking" -> bookingTool.execute(params);
                case "getMyBookings" -> myBookingsTool.execute(params);
                default -> {
                    logger.warn("Unknown tool requested: {}", toolName);
                    yield "{\"error\": \"Unknown tool: " + toolName + "\"}";
                }
            };

            long elapsed = System.currentTimeMillis() - start;
            logger.info("Tool '{}' executed in {}ms", toolName, elapsed);

            return result;

        } catch (Exception e) {
            logger.error("Tool execution failed for '{}': {}", toolName, e.getMessage(), e);
            return "{\"error\": \"Tool execution failed: " + escapeJson(e.getMessage()) + "\"}";
        }
    }

    private Map<String, Object> parseArguments(String argumentsJson) {
        if (argumentsJson == null || argumentsJson.trim().isEmpty() || argumentsJson.trim().equals("{}")) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(argumentsJson, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            logger.warn("Failed to parse tool arguments: {}", argumentsJson, e);
            return Map.of();
        }
    }

    /**
     * Returns the OpenAI-compatible tool definitions for all available tools.
     */
    public String getToolDefinitionsJson() {
        return """
                [
                  {
                    "type": "function",
                    "function": {
                      "name": "searchServices",
                      "description": "Search for salon services by keyword. Use this to find what services are available across all salons (e.g., 'haircut', 'facial', 'beard', 'spa', 'massage').",
                      "parameters": {
                        "type": "object",
                        "properties": {
                          "keyword": {
                            "type": "string",
                            "description": "The service name or keyword to search for"
                          }
                        },
                        "required": ["keyword"]
                      }
                    }
                  },
                  {
                    "type": "function",
                    "function": {
                      "name": "searchSalons",
                      "description": "Search for salons/parlours. Can filter by name, address, minimum rating, maximum price budget, and service type.",
                      "parameters": {
                        "type": "object",
                        "properties": {
                          "search": {
                            "type": "string",
                            "description": "Text to search in salon name or address"
                          },
                          "minRating": {
                            "type": "number",
                            "description": "Minimum salon rating (e.g., 4.5)"
                          },
                          "maxPrice": {
                            "type": "number",
                            "description": "Maximum price budget for services in INR"
                          },
                          "serviceKeyword": {
                            "type": "string",
                            "description": "Filter to salons that offer this type of service (e.g., 'haircut')"
                          }
                        },
                        "required": []
                      }
                    }
                  },
                  {
                    "type": "function",
                    "function": {
                      "name": "getAvailableSlots",
                      "description": "Get available appointment time slots for a specific salon on a specific date. Optionally filter by preferred time range.",
                      "parameters": {
                        "type": "object",
                        "properties": {
                          "shopId": {
                            "type": "integer",
                            "description": "The salon/shop ID"
                          },
                          "date": {
                            "type": "string",
                            "description": "The date to check availability for, in YYYY-MM-DD format"
                          },
                          "preferredAfter": {
                            "type": "string",
                            "description": "Preferred earliest time in HH:MM format (e.g., '17:00' for after 5 PM)"
                          },
                          "preferredBefore": {
                            "type": "string",
                            "description": "Preferred latest time in HH:MM format (e.g., '20:00' for before 8 PM)"
                          }
                        },
                        "required": ["shopId", "date"]
                      }
                    }
                  },
                  {
                    "type": "function",
                    "function": {
                      "name": "getSalonDetails",
                      "description": "Get detailed information about a specific salon including all its services, rating, address, and operating hours.",
                      "parameters": {
                        "type": "object",
                        "properties": {
                          "shopId": {
                            "type": "integer",
                            "description": "The salon/shop ID"
                          }
                        },
                        "required": ["shopId"]
                      }
                    }
                  },
                  {
                    "type": "function",
                    "function": {
                      "name": "createBooking",
                      "description": "Create an appointment booking. IMPORTANT: Only call this AFTER showing the customer a summary (salon name, service, date, time, price) and receiving their EXPLICIT confirmation (e.g., 'yes', 'confirm', 'book it', 'go ahead').",
                      "parameters": {
                        "type": "object",
                        "properties": {
                          "shopId": {
                            "type": "integer",
                            "description": "The salon/shop ID"
                          },
                          "serviceId": {
                            "type": "integer",
                            "description": "The service ID"
                          },
                          "slotId": {
                            "type": "integer",
                            "description": "The time slot ID"
                          }
                        },
                        "required": ["shopId", "serviceId", "slotId"]
                      }
                    }
                  },
                  {
                    "type": "function",
                    "function": {
                      "name": "getMyBookings",
                      "description": "Get the customer's existing bookings. Shows their recent appointments with status, dates, and payment info.",
                      "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                      }
                    }
                  }
                ]
                """;
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
