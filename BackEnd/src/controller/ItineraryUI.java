package controller;
import helpers.Login;

import java.sql.*;


public class ItineraryUI {
    // change these fields according to the DB server setup on your computer
    static private String url = "jdbc:mysql://localhost:3306";
    static private String user = "root";
    static private String pass = "password123";

    public void login() {
        Login login = new Login();
        login.init();
    }


    public static void main(String[] args) {
        ItineraryUI itinerary = new ItineraryUI();
        itinerary.login();
    }
}
