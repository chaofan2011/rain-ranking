-- MySQL dump 10.13  Distrib 8.0.46, for macos26.4 (arm64)
--
-- Host: localhost    Database: rain_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `city`
--

DROP TABLE IF EXISTS `city`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `city` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '城市名称',
  `province` varchar(50) NOT NULL COMMENT '省份',
  `location_id` varchar(20) NOT NULL COMMENT '和风天气LocationID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_location_id` (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city`
--

LOCK TABLES `city` WRITE;
/*!40000 ALTER TABLE `city` DISABLE KEYS */;
INSERT INTO `city` VALUES (1,'北京','北京市','101010100','2026-06-06 18:57:14'),(2,'天津','天津市','101030100','2026-06-06 18:57:14'),(3,'上海','上海市','101020100','2026-06-06 18:57:14'),(4,'重庆','重庆市','101040100','2026-06-06 18:57:14'),(5,'石家庄','河北省','101090101','2026-06-06 18:57:14'),(6,'太原','山西省','101100101','2026-06-06 18:57:14'),(7,'沈阳','辽宁省','101070101','2026-06-06 18:57:14'),(8,'长春','吉林省','101060101','2026-06-06 18:57:14'),(9,'哈尔滨','黑龙江省','101050101','2026-06-06 18:57:14'),(10,'南京','江苏省','101190101','2026-06-06 18:57:14'),(11,'杭州','浙江省','101210101','2026-06-06 18:57:14'),(12,'合肥','安徽省','101220101','2026-06-06 18:57:14'),(13,'福州','福建省','101230101','2026-06-06 18:57:14'),(14,'南昌','江西省','101240101','2026-06-06 18:57:14'),(15,'济南','山东省','101120101','2026-06-06 18:57:14'),(16,'郑州','河南省','101180101','2026-06-06 18:57:14'),(17,'武汉','湖北省','101200101','2026-06-06 18:57:14'),(18,'长沙','湖南省','101250101','2026-06-06 18:57:14'),(19,'广州','广东省','101280101','2026-06-06 18:57:14'),(20,'海口','海南省','101310101','2026-06-06 18:57:14'),(21,'成都','四川省','101270101','2026-06-06 18:57:14'),(22,'贵阳','贵州省','101260101','2026-06-06 18:57:14'),(23,'昆明','云南省','101290101','2026-06-06 18:57:14'),(24,'西安','陕西省','101110101','2026-06-06 18:57:14'),(25,'兰州','甘肃省','101160101','2026-06-06 18:57:14'),(26,'西宁','青海省','101150101','2026-06-06 18:57:14'),(27,'呼和浩特','内蒙古自治区','101080101','2026-06-06 18:57:14'),(28,'南宁','广西壮族自治区','101300101','2026-06-06 18:57:14'),(29,'拉萨','西藏自治区','101140101','2026-06-06 18:57:14'),(30,'银川','宁夏回族自治区','101170101','2026-06-06 18:57:14'),(31,'乌鲁木齐','新疆维吾尔自治区','101130101','2026-06-06 18:57:14'),(32,'香港','香港特别行政区','101320101','2026-06-06 18:57:14'),(33,'澳门','澳门特别行政区','101330101','2026-06-06 18:57:14');
/*!40000 ALTER TABLE `city` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rain_daily`
--

DROP TABLE IF EXISTS `rain_daily`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rain_daily` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `city_id` int NOT NULL,
  `rain_date` date NOT NULL COMMENT '降雨日期',
  `rainfall` decimal(8,2) NOT NULL DEFAULT '0.00' COMMENT '降雨量(mm)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_city_date` (`city_id`,`rain_date`),
  CONSTRAINT `fk_rain_city` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rain_daily`
--

LOCK TABLES `rain_daily` WRITE;
/*!40000 ALTER TABLE `rain_daily` DISABLE KEYS */;
INSERT INTO `rain_daily` VALUES (1,1,'2026-06-05',0.00,'2026-06-06 21:18:40'),(2,2,'2026-06-05',0.00,'2026-06-06 21:18:40'),(3,3,'2026-06-05',3.00,'2026-06-06 21:18:40'),(4,4,'2026-06-05',0.00,'2026-06-06 21:18:40'),(5,5,'2026-06-05',0.00,'2026-06-06 21:18:40'),(6,6,'2026-06-05',0.00,'2026-06-06 21:18:40'),(7,7,'2026-06-05',0.00,'2026-06-06 21:18:40'),(8,8,'2026-06-05',1.00,'2026-06-06 21:18:40'),(9,9,'2026-06-05',4.00,'2026-06-06 21:18:40'),(10,10,'2026-06-05',0.00,'2026-06-06 21:18:40'),(11,11,'2026-06-05',0.00,'2026-06-06 21:18:40'),(12,12,'2026-06-05',0.00,'2026-06-06 21:18:40'),(13,13,'2026-06-05',0.00,'2026-06-06 21:18:40'),(14,14,'2026-06-05',0.00,'2026-06-06 21:18:40'),(15,15,'2026-06-05',4.00,'2026-06-06 21:18:40'),(16,16,'2026-06-05',0.00,'2026-06-06 21:18:40'),(17,17,'2026-06-05',0.00,'2026-06-06 21:18:40'),(18,18,'2026-06-05',3.00,'2026-06-06 21:18:40'),(19,19,'2026-06-05',0.00,'2026-06-06 21:18:40'),(20,20,'2026-06-05',16.00,'2026-06-06 21:18:40'),(21,21,'2026-06-05',0.00,'2026-06-06 21:18:40'),(22,22,'2026-06-05',0.00,'2026-06-06 21:18:40'),(23,23,'2026-06-05',1.00,'2026-06-06 21:18:40'),(24,24,'2026-06-05',0.00,'2026-06-06 21:18:40'),(25,25,'2026-06-05',0.00,'2026-06-06 21:18:40'),(26,26,'2026-06-05',0.00,'2026-06-06 21:18:40'),(27,27,'2026-06-05',0.00,'2026-06-06 21:18:41'),(28,28,'2026-06-05',49.00,'2026-06-06 21:18:41'),(29,29,'2026-06-05',0.00,'2026-06-06 21:18:41'),(30,30,'2026-06-05',0.00,'2026-06-06 21:18:41'),(31,31,'2026-06-05',0.00,'2026-06-06 21:18:41'),(32,32,'2026-06-05',3.70,'2026-06-06 21:18:41'),(33,33,'2026-06-05',6.60,'2026-06-06 21:18:41');
/*!40000 ALTER TABLE `rain_daily` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-07 11:43:36
