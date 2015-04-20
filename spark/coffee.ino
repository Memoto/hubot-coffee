int pin = A0;

void setup() {

}

void loop() {
    int newVal = analogRead(A0);

    if(newVal > 300) {
        Spark.publish("brew_active", String(random(50000)), 60, PRIVATE);
    }

    delay(10000);
}
