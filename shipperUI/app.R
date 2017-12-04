library(shiny)
library(shinydashboard)
library(googleVis)
library(dplyr)
library(readr)

ui <- dashboardPage(skin = "green",
                    
                    dashboardHeader(title = 'Shipper UI', titleWidth = 250),
                    
                    dashboardSidebar(width = 250,
                                     sidebarMenu(
                                       menuItem("Create request", tabName = "requestTruck", icon = icon("home")),
                                       menuItem("View bids", tabName = "viewBids", icon = icon("free-code-camp")),
                                       menuItem("Track contracts", tabName = "activeContracts", icon = icon("area-chart")),
                                       menuItem("My Profile", tabName = "profile", icon = icon("address-card-o"))
                                     )
                    ),
                    
                    dashboardBody(
                      tabItems(
                        tabItem(tabName = "requestTruck",
                                selectInput("contractType", "Contract Type", c(
                                  "Type 1" = "ct1",	
                                  "Type 2" = "ct2",	
                                  "Type 3" = "ct3"
                                ))
                        ),
                        
                        tabItem(tabName = "viewBids",
                                p("")
                        ),
                        tabItem(tabName = "viewContracts",
                                p("")
                        ),
                        tabItem(tabName = "profile",
                                p("")
                        )
                      )
                    )
)

server <- function(input, output) {
  
}

# Run the application 
shinyApp(ui = ui, server = server)

