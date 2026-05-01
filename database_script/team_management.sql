-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: test
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-01 19:07:11
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: uscpp
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_feed`
--

DROP TABLE IF EXISTS `activity_feed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_feed` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `activity_feed_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_feed`
--

LOCK TABLES `activity_feed` WRITE;
/*!40000 ALTER TABLE `activity_feed` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_feed` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `message` text,
  `created_by` int DEFAULT NULL,
  `is_pinned` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `meeting_id` int DEFAULT NULL,
  `status` enum('present','absent') DEFAULT 'absent',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `meeting_id` (`meeting_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_groups`
--

DROP TABLE IF EXISTS `chat_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_by` int DEFAULT NULL,
  `is_general` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_groups`
--

LOCK TABLES `chat_groups` WRITE;
/*!40000 ALTER TABLE `chat_groups` DISABLE KEYS */;
INSERT INTO `chat_groups` VALUES (1,'InnovateX General',1,1,'2026-05-01 11:24:20'),(3,'Team-1',1,0,'2026-05-01 12:08:58'),(4,'Team-2',1,0,'2026-05-01 12:09:25'),(5,'Team-3',1,0,'2026-05-01 12:09:57');
/*!40000 ALTER TABLE `chat_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int DEFAULT NULL,
  `sender_id` int DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  `is_edited` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `group_id` (`group_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `chat_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (13,1,1,'hello','2026-05-01 11:26:08',1,0),(14,1,1,'hello','2026-05-01 11:26:12',1,0),(15,1,1,'sds','2026-05-01 11:28:17',1,0),(17,1,1,'lkl','2026-05-01 11:36:27',1,0),(18,1,8,'jj','2026-05-01 11:56:42',1,0);
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_members`
--

DROP TABLE IF EXISTS `group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `group_id` (`group_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `chat_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_members`
--

LOCK TABLES `group_members` WRITE;
/*!40000 ALTER TABLE `group_members` DISABLE KEYS */;
INSERT INTO `group_members` VALUES (30,1,9),(31,1,10),(32,1,7),(33,1,8),(34,1,6),(35,1,2),(36,1,1),(37,1,5),(38,1,4),(39,1,3),(49,3,8),(50,3,7),(51,3,9),(52,3,1),(53,4,10),(54,4,6),(55,4,2),(56,4,1),(57,5,3),(58,5,4),(59,5,5),(60,5,1);
/*!40000 ALTER TABLE `group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meetings`
--

DROP TABLE IF EXISTS `meetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meetings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `meeting_link` varchar(255) DEFAULT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `meetings_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meetings`
--

LOCK TABLES `meetings` WRITE;
/*!40000 ALTER TABLE `meetings` DISABLE KEYS */;
/*!40000 ALTER TABLE `meetings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_reads`
--

DROP TABLE IF EXISTS `message_reads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_reads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `message_id` (`message_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `message_reads_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `message_reads_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_reads`
--

LOCK TABLES `message_reads` WRITE;
/*!40000 ALTER TABLE `message_reads` DISABLE KEYS */;
/*!40000 ALTER TABLE `message_reads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=215 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,9,'New message in group chat',0,'2026-05-01 05:10:02'),(2,10,'New message in group chat',0,'2026-05-01 05:10:02'),(3,7,'New message in group chat',0,'2026-05-01 05:10:02'),(4,8,'New message in group chat',0,'2026-05-01 05:10:02'),(5,6,'New message in group chat',0,'2026-05-01 05:10:02'),(6,2,'New message in group chat',0,'2026-05-01 05:10:02'),(7,1,'New message in group chat',0,'2026-05-01 05:10:02'),(8,5,'New message in group chat',0,'2026-05-01 05:10:02'),(9,4,'New message in group chat',0,'2026-05-01 05:10:02'),(10,9,'New message in group chat',0,'2026-05-01 05:10:02'),(11,10,'New message in group chat',0,'2026-05-01 05:10:02'),(12,7,'New message in group chat',0,'2026-05-01 05:10:02'),(13,8,'New message in group chat',0,'2026-05-01 05:10:02'),(14,6,'New message in group chat',0,'2026-05-01 05:10:02'),(15,2,'New message in group chat',0,'2026-05-01 05:10:02'),(16,1,'New message in group chat',0,'2026-05-01 05:10:02'),(17,5,'New message in group chat',0,'2026-05-01 05:10:02'),(18,4,'New message in group chat',0,'2026-05-01 05:10:02'),(19,9,'New message in group chat',0,'2026-05-01 05:10:07'),(20,10,'New message in group chat',0,'2026-05-01 05:10:07'),(21,7,'New message in group chat',0,'2026-05-01 05:10:07'),(22,8,'New message in group chat',0,'2026-05-01 05:10:07'),(23,6,'New message in group chat',0,'2026-05-01 05:10:07'),(24,2,'New message in group chat',0,'2026-05-01 05:10:07'),(25,1,'New message in group chat',0,'2026-05-01 05:10:07'),(26,5,'New message in group chat',0,'2026-05-01 05:10:07'),(27,4,'New message in group chat',0,'2026-05-01 05:10:07'),(28,9,'New message in group chat',0,'2026-05-01 05:10:07'),(29,10,'New message in group chat',0,'2026-05-01 05:10:07'),(30,7,'New message in group chat',0,'2026-05-01 05:10:07'),(31,8,'New message in group chat',0,'2026-05-01 05:10:07'),(32,6,'New message in group chat',0,'2026-05-01 05:10:07'),(33,2,'New message in group chat',0,'2026-05-01 05:10:07'),(34,1,'New message in group chat',0,'2026-05-01 05:10:07'),(35,5,'New message in group chat',0,'2026-05-01 05:10:07'),(36,4,'New message in group chat',0,'2026-05-01 05:10:07'),(37,9,'New message in group chat',0,'2026-05-01 05:10:13'),(38,10,'New message in group chat',0,'2026-05-01 05:10:13'),(39,7,'New message in group chat',0,'2026-05-01 05:10:13'),(40,8,'New message in group chat',0,'2026-05-01 05:10:13'),(41,6,'New message in group chat',0,'2026-05-01 05:10:13'),(42,2,'New message in group chat',0,'2026-05-01 05:10:13'),(43,1,'New message in group chat',0,'2026-05-01 05:10:13'),(44,5,'New message in group chat',0,'2026-05-01 05:10:13'),(45,4,'New message in group chat',0,'2026-05-01 05:10:13'),(46,9,'New message in group chat',0,'2026-05-01 05:10:13'),(47,10,'New message in group chat',0,'2026-05-01 05:10:13'),(48,7,'New message in group chat',0,'2026-05-01 05:10:13'),(49,8,'New message in group chat',0,'2026-05-01 05:10:13'),(50,6,'New message in group chat',0,'2026-05-01 05:10:13'),(51,2,'New message in group chat',0,'2026-05-01 05:10:13'),(52,1,'New message in group chat',0,'2026-05-01 05:10:13'),(53,5,'New message in group chat',0,'2026-05-01 05:10:13'),(54,4,'New message in group chat',0,'2026-05-01 05:10:13'),(55,9,'New message in group chat',0,'2026-05-01 05:10:20'),(56,10,'New message in group chat',0,'2026-05-01 05:10:20'),(57,7,'New message in group chat',0,'2026-05-01 05:10:20'),(58,8,'New message in group chat',0,'2026-05-01 05:10:20'),(59,6,'New message in group chat',0,'2026-05-01 05:10:20'),(60,2,'New message in group chat',0,'2026-05-01 05:10:20'),(61,1,'New message in group chat',0,'2026-05-01 05:10:20'),(62,5,'New message in group chat',0,'2026-05-01 05:10:20'),(63,4,'New message in group chat',0,'2026-05-01 05:10:20'),(64,9,'New message in group chat',0,'2026-05-01 05:10:20'),(65,10,'New message in group chat',0,'2026-05-01 05:10:20'),(66,7,'New message in group chat',0,'2026-05-01 05:10:20'),(67,8,'New message in group chat',0,'2026-05-01 05:10:20'),(68,6,'New message in group chat',0,'2026-05-01 05:10:20'),(69,2,'New message in group chat',0,'2026-05-01 05:10:20'),(70,1,'New message in group chat',0,'2026-05-01 05:10:20'),(71,5,'New message in group chat',0,'2026-05-01 05:10:20'),(72,4,'New message in group chat',0,'2026-05-01 05:10:20'),(73,9,'New message in group chat',0,'2026-05-01 05:10:27'),(74,10,'New message in group chat',0,'2026-05-01 05:10:27'),(75,7,'New message in group chat',0,'2026-05-01 05:10:27'),(76,8,'New message in group chat',0,'2026-05-01 05:10:27'),(77,6,'New message in group chat',0,'2026-05-01 05:10:27'),(78,2,'New message in group chat',0,'2026-05-01 05:10:27'),(79,1,'New message in group chat',0,'2026-05-01 05:10:27'),(80,5,'New message in group chat',0,'2026-05-01 05:10:27'),(81,4,'New message in group chat',0,'2026-05-01 05:10:27'),(82,9,'New message in group chat',0,'2026-05-01 05:10:27'),(83,10,'New message in group chat',0,'2026-05-01 05:10:27'),(84,7,'New message in group chat',0,'2026-05-01 05:10:27'),(85,8,'New message in group chat',0,'2026-05-01 05:10:27'),(86,6,'New message in group chat',0,'2026-05-01 05:10:27'),(87,2,'New message in group chat',0,'2026-05-01 05:10:27'),(88,1,'New message in group chat',0,'2026-05-01 05:10:27'),(89,5,'New message in group chat',0,'2026-05-01 05:10:27'),(90,4,'New message in group chat',0,'2026-05-01 05:10:27'),(91,9,'New message in group chat',0,'2026-05-01 05:11:46'),(92,10,'New message in group chat',0,'2026-05-01 05:11:46'),(93,7,'New message in group chat',0,'2026-05-01 05:11:46'),(94,8,'New message in group chat',0,'2026-05-01 05:11:46'),(95,6,'New message in group chat',0,'2026-05-01 05:11:46'),(96,2,'New message in group chat',0,'2026-05-01 05:11:46'),(97,5,'New message in group chat',0,'2026-05-01 05:11:46'),(98,4,'New message in group chat',0,'2026-05-01 05:11:46'),(99,3,'New message in group chat',0,'2026-05-01 05:11:46'),(100,9,'New message in group chat',0,'2026-05-01 05:11:46'),(101,10,'New message in group chat',0,'2026-05-01 05:11:46'),(102,7,'New message in group chat',0,'2026-05-01 05:11:46'),(103,8,'New message in group chat',0,'2026-05-01 05:11:46'),(104,6,'New message in group chat',0,'2026-05-01 05:11:46'),(105,2,'New message in group chat',0,'2026-05-01 05:11:46'),(106,5,'New message in group chat',0,'2026-05-01 05:11:46'),(107,4,'New message in group chat',0,'2026-05-01 05:11:46'),(108,3,'New message in group chat',0,'2026-05-01 05:11:46'),(109,9,'New message in group chat',0,'2026-05-01 05:11:55'),(110,10,'New message in group chat',0,'2026-05-01 05:11:55'),(111,7,'New message in group chat',0,'2026-05-01 05:11:55'),(112,8,'New message in group chat',0,'2026-05-01 05:11:55'),(113,6,'New message in group chat',0,'2026-05-01 05:11:55'),(114,2,'New message in group chat',0,'2026-05-01 05:11:55'),(115,5,'New message in group chat',0,'2026-05-01 05:11:55'),(116,4,'New message in group chat',0,'2026-05-01 05:11:55'),(117,3,'New message in group chat',0,'2026-05-01 05:11:55'),(118,9,'New message in group chat',0,'2026-05-01 05:11:55'),(119,10,'New message in group chat',0,'2026-05-01 05:11:55'),(120,7,'New message in group chat',0,'2026-05-01 05:11:55'),(121,8,'New message in group chat',0,'2026-05-01 05:11:55'),(122,6,'New message in group chat',0,'2026-05-01 05:11:55'),(123,2,'New message in group chat',0,'2026-05-01 05:11:55'),(124,5,'New message in group chat',0,'2026-05-01 05:11:55'),(125,4,'New message in group chat',0,'2026-05-01 05:11:55'),(126,3,'New message in group chat',0,'2026-05-01 05:11:55'),(127,8,'New message in group chat',0,'2026-05-01 05:12:05'),(128,9,'New message in group chat',0,'2026-05-01 05:12:05'),(129,7,'New message in group chat',0,'2026-05-01 05:12:05'),(130,9,'New message in group chat',0,'2026-05-01 05:20:45'),(131,10,'New message in group chat',0,'2026-05-01 05:20:45'),(132,7,'New message in group chat',0,'2026-05-01 05:20:45'),(133,6,'New message in group chat',0,'2026-05-01 05:20:45'),(134,2,'New message in group chat',0,'2026-05-01 05:20:45'),(135,1,'New message in group chat',0,'2026-05-01 05:20:45'),(136,5,'New message in group chat',0,'2026-05-01 05:20:45'),(137,4,'New message in group chat',0,'2026-05-01 05:20:45'),(138,3,'New message in group chat',0,'2026-05-01 05:20:45'),(139,9,'New message in group chat',0,'2026-05-01 05:20:45'),(140,10,'New message in group chat',0,'2026-05-01 05:20:45'),(141,7,'New message in group chat',0,'2026-05-01 05:20:45'),(142,6,'New message in group chat',0,'2026-05-01 05:20:45'),(143,2,'New message in group chat',0,'2026-05-01 05:20:45'),(144,1,'New message in group chat',0,'2026-05-01 05:20:45'),(145,5,'New message in group chat',0,'2026-05-01 05:20:45'),(146,4,'New message in group chat',0,'2026-05-01 05:20:45'),(147,3,'New message in group chat',0,'2026-05-01 05:20:45'),(148,9,'New message in group chat',0,'2026-05-01 05:23:04'),(149,10,'New message in group chat',0,'2026-05-01 05:23:04'),(150,7,'New message in group chat',0,'2026-05-01 05:23:04'),(151,8,'New message in group chat',0,'2026-05-01 05:23:04'),(152,6,'New message in group chat',0,'2026-05-01 05:23:04'),(153,2,'New message in group chat',0,'2026-05-01 05:23:04'),(154,5,'New message in group chat',0,'2026-05-01 05:23:04'),(155,4,'New message in group chat',0,'2026-05-01 05:23:04'),(156,3,'New message in group chat',0,'2026-05-01 05:23:04'),(157,9,'New message in group chat',0,'2026-05-01 05:23:04'),(158,10,'New message in group chat',0,'2026-05-01 05:23:04'),(159,7,'New message in group chat',0,'2026-05-01 05:23:04'),(160,8,'New message in group chat',0,'2026-05-01 05:23:04'),(161,6,'New message in group chat',0,'2026-05-01 05:23:04'),(162,2,'New message in group chat',0,'2026-05-01 05:23:04'),(163,5,'New message in group chat',0,'2026-05-01 05:23:04'),(164,4,'New message in group chat',0,'2026-05-01 05:23:04'),(165,3,'New message in group chat',0,'2026-05-01 05:23:04'),(166,8,'You have been assigned a new task: Mini project',0,'2026-05-01 05:32:08'),(167,9,'New message in group chat',0,'2026-05-01 11:26:08'),(168,10,'New message in group chat',0,'2026-05-01 11:26:08'),(169,7,'New message in group chat',0,'2026-05-01 11:26:08'),(170,8,'New message in group chat',0,'2026-05-01 11:26:08'),(171,6,'New message in group chat',0,'2026-05-01 11:26:08'),(172,2,'New message in group chat',0,'2026-05-01 11:26:08'),(173,5,'New message in group chat',0,'2026-05-01 11:26:08'),(174,4,'New message in group chat',0,'2026-05-01 11:26:08'),(175,3,'New message in group chat',0,'2026-05-01 11:26:08'),(176,9,'New message in group chat',0,'2026-05-01 11:26:12'),(177,10,'New message in group chat',0,'2026-05-01 11:26:12'),(178,7,'New message in group chat',0,'2026-05-01 11:26:12'),(179,8,'New message in group chat',0,'2026-05-01 11:26:12'),(180,6,'New message in group chat',0,'2026-05-01 11:26:12'),(181,2,'New message in group chat',0,'2026-05-01 11:26:12'),(182,5,'New message in group chat',0,'2026-05-01 11:26:12'),(183,4,'New message in group chat',0,'2026-05-01 11:26:12'),(184,3,'New message in group chat',0,'2026-05-01 11:26:12'),(185,9,'New message in group chat',0,'2026-05-01 11:28:17'),(186,10,'New message in group chat',0,'2026-05-01 11:28:17'),(187,7,'New message in group chat',0,'2026-05-01 11:28:17'),(188,8,'New message in group chat',0,'2026-05-01 11:28:17'),(189,6,'New message in group chat',0,'2026-05-01 11:28:17'),(190,2,'New message in group chat',0,'2026-05-01 11:28:17'),(191,5,'New message in group chat',0,'2026-05-01 11:28:17'),(192,4,'New message in group chat',0,'2026-05-01 11:28:17'),(193,3,'New message in group chat',0,'2026-05-01 11:28:17'),(194,2,'New message in group chat',0,'2026-05-01 11:36:00'),(195,3,'New message in group chat',0,'2026-05-01 11:36:00'),(196,4,'New message in group chat',0,'2026-05-01 11:36:00'),(197,9,'New message in group chat',0,'2026-05-01 11:36:27'),(198,10,'New message in group chat',0,'2026-05-01 11:36:27'),(199,7,'New message in group chat',0,'2026-05-01 11:36:27'),(200,8,'New message in group chat',0,'2026-05-01 11:36:27'),(201,6,'New message in group chat',0,'2026-05-01 11:36:27'),(202,2,'New message in group chat',0,'2026-05-01 11:36:27'),(203,5,'New message in group chat',0,'2026-05-01 11:36:27'),(204,4,'New message in group chat',0,'2026-05-01 11:36:27'),(205,3,'New message in group chat',0,'2026-05-01 11:36:27'),(206,9,'New message in group chat',0,'2026-05-01 11:56:42'),(207,10,'New message in group chat',0,'2026-05-01 11:56:42'),(208,7,'New message in group chat',0,'2026-05-01 11:56:42'),(209,6,'New message in group chat',0,'2026-05-01 11:56:42'),(210,2,'New message in group chat',0,'2026-05-01 11:56:42'),(211,1,'New message in group chat',0,'2026-05-01 11:56:42'),(212,5,'New message in group chat',0,'2026-05-01 11:56:42'),(213,4,'New message in group chat',0,'2026-05-01 11:56:42'),(214,3,'New message in group chat',0,'2026-05-01 11:56:42');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poll_options`
--

DROP TABLE IF EXISTS `poll_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poll_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `poll_id` int DEFAULT NULL,
  `option_text` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `poll_id` (`poll_id`),
  CONSTRAINT `poll_options_ibfk_1` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poll_options`
--

LOCK TABLES `poll_options` WRITE;
/*!40000 ALTER TABLE `poll_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `poll_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poll_votes`
--

DROP TABLE IF EXISTS `poll_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poll_votes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `poll_id` int DEFAULT NULL,
  `option_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `poll_id` (`poll_id`),
  KEY `option_id` (`option_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `poll_votes_ibfk_1` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`) ON DELETE CASCADE,
  CONSTRAINT `poll_votes_ibfk_2` FOREIGN KEY (`option_id`) REFERENCES `poll_options` (`id`) ON DELETE CASCADE,
  CONSTRAINT `poll_votes_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poll_votes`
--

LOCK TABLES `poll_votes` WRITE;
/*!40000 ALTER TABLE `poll_votes` DISABLE KEYS */;
/*!40000 ALTER TABLE `poll_votes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `polls`
--

DROP TABLE IF EXISTS `polls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `polls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `polls_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `polls`
--

LOCK TABLES `polls` WRITE;
/*!40000 ALTER TABLE `polls` DISABLE KEYS */;
/*!40000 ALTER TABLE `polls` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `predefined_skills`
--

DROP TABLE IF EXISTS `predefined_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `predefined_skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `skill_name` varchar(200) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `total_levels` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `predefined_skills`
--

LOCK TABLES `predefined_skills` WRITE;
/*!40000 ALTER TABLE `predefined_skills` DISABLE KEYS */;
/*!40000 ALTER TABLE `predefined_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_members`
--

DROP TABLE IF EXISTS `project_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `project_members_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_members`
--

LOCK TABLES `project_members` WRITE;
/*!40000 ALTER TABLE `project_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `status` enum('in-progress','completed','incomplete') DEFAULT 'in-progress',
  `deadline` date DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `skill_name` varchar(100) NOT NULL,
  `status` enum('not_started','in_progress','completed') DEFAULT 'not_started',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `skills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `assigned_to` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('todo','in_progress','completed') DEFAULT 'todo',
  `deadline` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`),
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (3,'Update AP','DO IT QUICKLY ASAP',3,4,'high','completed','2026-04-30','2026-04-30 12:02:17'),(4,'Mini project','Do it quickly',8,1,'high','completed','2026-04-28','2026-05-01 05:32:08');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_skill_progress`
--

DROP TABLE IF EXISTS `user_skill_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_skill_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `skill_id` int DEFAULT NULL,
  `completed_levels` int DEFAULT '0',
  `status` enum('not-started','in-progress','completed') DEFAULT 'not-started',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `skill_id` (`skill_id`),
  CONSTRAINT `user_skill_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_skill_progress_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `predefined_skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_skill_progress`
--

LOCK TABLES `user_skill_progress` WRITE;
/*!40000 ALTER TABLE `user_skill_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_skill_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'member',
  `ap_points` int DEFAULT '0',
  `rp_points` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Selvakarshan C K','selvakarshan.ck@innovatex.ac.in','$2b$10$RG0sgqDGpqLb3QoqujaPw.fcdH68VEr//3XguY82p.1.NdTM2UJPu','captain',2546,0,'2026-04-29 10:11:16'),(2,'Santhosh S','santhosh.s@innovatex.ac.in','$2b$10$0AEZT.A0MImbDC0sLptEIOJOwt/nWM.REQa1g/c25x0NIx3iNPx4q','vice-captain',5675,0,'2026-04-29 10:11:16'),(3,'Yalini Sri T','yalinisri.t@innovatex.ac.in','$2b$10$aU6wE1WjjPxt.34WrzNW0.B.8HTyvdfIJMWsx2.ZKMUVme5u1VLje','manager',5675,0,'2026-04-29 10:11:16'),(4,'Tharun M','tharun.m@innovatex.ac.in','$2b$10$BjRDa8odMZJyR2FTqhE1mefVp/3dAr.PXhbEuEYcpfQ1UyGnhZgM2','strategist',4567,0,'2026-04-29 10:11:16'),(5,'Sudhir S','sudhir.s@innovatex.ac.in','$2b$10$b/JFcYI.8z6/Dh.Z9/8lyORmcxsxnoL26aWRfxDC2oIEszY.R/L9y','member',3456,0,'2026-04-29 10:11:16'),(6,'Naveen Karthi M','naveenkarthi.m@innovatex.ac.in','$2b$10$GMagNiFA3AD.Pfp9lmEbVux1cYGXFbSMP.wZTCgRl.N3CeCberji6','member',1987,0,'2026-04-29 10:11:17'),(7,'Nandhakishore L','nandhakishore.l@innovatex.ac.in','$2b$10$MoB226lO32yLeUKLckDsnudZsDmn.EpL6X4VkIGfOR71f3z1rRT8q','member',4567,0,'2026-04-29 10:11:17'),(8,'Nandhini K','nandhini.k@innovatex.ac.in','$2b$10$WTRy9fs8tuP3IstqHFPJV.WqYOWAYPeZh3FuE7Cr4Rr5ozXzpJP7q','member',11678,0,'2026-04-29 10:11:17'),(9,'Akilesh G','akilesh.g@innovatex.ac.in','$2b$10$F0gUIxKgB8x8YMBmdAcNCeZ6tGagHtRZRZyZ5TlIh93vgjPAA5Chi','member',4568,0,'2026-04-29 10:11:17'),(10,'Dhiya K N','dhiya.kn@innovatex.ac.in','$2b$10$iJMKFGsf2dt1E3faHTmwOO7HritHlA6C/fAzzJGjuLK2cr7SkZIr6','member',13110,0,'2026-04-29 10:11:17');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-01 19:07:12
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: company
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `email` varchar(100) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `admn_number` int DEFAULT NULL,
  `gender` tinyint DEFAULT NULL,
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('name1@gmail.com','name1',7894562,NULL),('name2@gmail.com','name2',74185296,NULL),('name3@gmail.com','name3',8527496,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-01 19:07:12
